import { generateRecommendationReason } from "@/lib/ai/generate-recommendation-reason";
import { ONBOARDING_MOVIE_TITLE_SET } from "@/lib/onboarding/onboarding-movie-list";
import { buildContextVector } from "@/lib/recommendation/build-context-vector";
import { buildKnownTasteVector } from "@/lib/recommendation/build-known-taste-vector";
import { buildMbtiAdjustmentVector } from "@/lib/recommendation/build-mbti-vector";
import { buildRecommendationTrace } from "@/lib/recommendation/build-recommendation-trace";
import { RECOMMENDATION_FEATURE_FLAGS } from "@/lib/recommendation/constants";
import { type FeatureDimension, type FeatureVector, cosineSimilarity, extractMovieVector } from "@/lib/recommendation/feature-vector";
import { scoreFinalPreRerank } from "@/lib/recommendation/ranking/score-final-pre-rerank";
import { runRetrieval } from "@/lib/recommendation/retrieval/run-retrieval";
import { buildRecentRecommendationIndex, computeRepetitionPenalty } from "@/lib/recommendation/repetition-control";
import { rerankTopPicks } from "@/lib/recommendation/rerank-top-picks";
import { scoreBaseRelevance } from "@/lib/recommendation/score-base";
import { scoreNovelty } from "@/lib/recommendation/score-novelty";
import { type CandidateMovie, type DiscoverProfileInput, type MBTIRecommendContext, type RecommendMoviesArgs, type RecommendationOutput } from "@/lib/recommendation/types";

function applyDiscoverProfileBonus(baseScore: number, movie: CandidateMovie, profile: DiscoverProfileInput): number {
  const gw = profile.genreWeights[movie.genrePrimary ?? ""] ?? 0.5;
  let bonus = (gw - 0.5) * 0.4;
  for (const director of movie.directors ?? []) {
    const key = director.toLowerCase().replace(/\s+/g, "_");
    const dw = profile.directorAffinity[key] ?? 0.5;
    bonus += (dw - 0.5) * 0.3;
  }
  const writers = (movie.credits ?? [])
    .filter((credit) => credit.role === "writer")
    .map((credit) => credit.person.name);
  for (const writer of writers) {
    const key = writer.toLowerCase().replace(/\s+/g, "_");
    const ww = profile.writerAffinity[key] ?? 0.5;
    bonus += (ww - 0.5) * 0.24;
  }
  return Math.max(0, Math.min(1, baseScore + bonus));
}

function applyMBTIBonus(baseScore: number, movie: CandidateMovie, mbtiContext: MBTIRecommendContext): number {
  let bonus = 0;
  const movieText = [movie.genrePrimary, movie.genreSecondary, ...(movie.moodTags ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const genreMatches = mbtiContext.movieGenres.filter((genre) => movieText.includes(genre.toLowerCase()));
  bonus += genreMatches.length * 0.15;
  if (mbtiContext.score >= 4 && movie.complexity != null) bonus += movie.complexity * 0.1;
  if (mbtiContext.score <= 2 && movie.complexity != null) bonus -= movie.complexity * 0.1;
  return Math.min(baseScore + bonus, 1.0);
}

export function toConfidenceLabel(score: number): "very_high" | "high" | "medium" | "low" {
  if (score >= 0.88) return "very_high";
  if (score >= 0.72) return "high";
  if (score >= 0.55) return "medium";
  return "low";
}

function shouldIncludeMovie(movie: CandidateMovie, input: ContextInput) {
  if (ONBOARDING_MOVIE_TITLE_SET.has(movie.title)) return false;
  if (input.watchedMovieIds.includes(movie.id)) return false;
  if (movie.runtimeMinutes < input.desiredRuntimeMin || movie.runtimeMinutes > input.desiredRuntimeMax) return false;
  if (movie.contentWarnings.some((warning) => input.excludeContentWarnings.includes(warning))) return false;
  if (movie.moodTags.some((tag) => input.excludeTags.includes(tag))) return false;
  if (typeof input.minimumReviewScore === "number") {
    if (movie.reviewScore == null || movie.reviewScore < input.minimumReviewScore) return false;
  }
  return true;
}

type ContextInput = RecommendMoviesArgs["contextInput"];

export function recommendMovies(args: RecommendMoviesArgs): RecommendationOutput[] {
  const likedVectors: Array<{ vector: FeatureVector; weight: number }> = [];
  const rejectedVectors: Array<{ vector: FeatureVector; weight: number }> = [];
  const likedTitles: string[] = [];
  const rejectedTitles: string[] = [];

  for (const reaction of args.reactions) {
    const vector = extractMovieVector(reaction.movie);
    const weight = reaction.signalWeight ?? 1;
    if (reaction.reactionType === "liked") {
      likedVectors.push({ vector, weight });
      likedTitles.push(reaction.movie.title);
    } else if (reaction.reactionType === "not_for_me") {
      rejectedVectors.push({ vector, weight });
      rejectedTitles.push(reaction.movie.title);
    }
  }

  const knownTasteVector = buildKnownTasteVector({ likedVectors, rejectedVectors });
  const moodVector = buildContextVector({
    selectedMood: args.selectedMood,
    currentMoods: args.contextInput.currentMoods,
  });
  const mbtiVector = buildMbtiAdjustmentVector(args.selectedMbti);
  const hasMbtiSignal = Boolean(args.selectedMbti);
  const recentRecommendations = buildRecentRecommendationIndex(args.recentSessions);
  const eligibleMovies = args.movies.filter((movie) => shouldIncludeMovie(movie, args.contextInput));
  const retrieved = runRetrieval({
    movies: eligibleMovies,
    knownTasteVector,
    moodVector,
    watchingWith: args.contextInput.watchingWith,
    preferredDirectors: args.contextInput.preferredDirectors,
    preferredActors: args.contextInput.preferredActors,
  });

  const scored = retrieved
    .map((movie) => {
      const vector = movie.vector;
      const base = scoreBaseRelevance({
        candidateVector: vector,
        knownTasteVector,
        moodVector,
        mbtiVector,
        hasMbtiSignal,
        watchingWith: args.contextInput.watchingWith,
        useFavoritesInRecommendations: args.contextInput.useFavoritesInRecommendations,
        influenceStrength: args.contextInput.influenceStrength,
        preferredGenres: args.contextInput.preferredGenres,
        preferredDirectors: args.contextInput.preferredDirectors,
        preferredActors: args.contextInput.preferredActors,
        candidate: {
          genrePrimary: movie.movie.genrePrimary,
          genreSecondary: movie.movie.genreSecondary,
          watchContexts: movie.movie.watchContexts,
          directors: movie.movie.directors,
          cast: movie.movie.cast,
          reviewScore: movie.movie.reviewScore,
        },
        currentMoods: args.contextInput.currentMoods,
        retrievalSupportScore: movie.retrievalTrace.retrievalSupportScore,
      });
      const tasteSimilarity = knownTasteVector ? cosineSimilarity(knownTasteVector, vector) : null;
      const novelty = scoreNovelty({ tasteSimilarity });
      const repetitionPenalty = computeRepetitionPenalty({
        movieId: movie.movie.id,
        recentRecommendations,
        globalExposurePenalty: RECOMMENDATION_FEATURE_FLAGS.enableGlobalExposureDampening
          ? Math.max(0, movie.retrievalTrace.bestChannelScore - 0.9)
          : 0,
      });
      const preRerankScore = scoreFinalPreRerank({
        baseScore: base.baseScore,
        noveltyScore: novelty.noveltyScore,
        repetitionPenalty,
        recommendationStyleMode: args.contextInput.recommendationStyleMode,
      });
      const profileAdjusted = args.discoverProfile
        ? applyDiscoverProfileBonus(preRerankScore, movie.movie, args.discoverProfile)
        : preRerankScore;
      const totalScore = args.mbtiContext
        ? applyMBTIBonus(profileAdjusted, movie.movie, args.mbtiContext)
        : profileAdjusted;
      const trace = buildRecommendationTrace({
        candidateVector: vector,
        referenceVector: knownTasteVector ?? moodVector,
        scoreBreakdown: {
          tasteScore: base.tasteScore,
          moodScore: base.moodScore,
          mbtiScore: base.mbtiScore,
          watchContextScore: base.watchContextScore,
          creatorAffinityScore: base.creatorAffinityScore,
          genrePreferenceScore: base.genrePreferenceScore,
          qualityPriorScore: base.qualityPriorScore,
        },
        avoidedExclusions: args.contextInput.excludeContentWarnings,
        retrievalChannels: movie.retrievalTrace.channels,
      });
      return {
        movie: movie.movie,
        vector,
        preRerankScore,
        repetitionPenalty,
        totalScore,
        breakdown: {
          totalScore,
          preRerankScore,
          baseScore: base.baseScore,
          noveltyScore: novelty.noveltyScore,
          repetitionPenalty,
          knownTasteScore: base.tasteScore,
          currentMoodScore: base.moodScore,
          mbtiAdjustmentScore: base.mbtiScore,
          watchContextScore: base.watchContextScore,
          creatorAffinityScore: base.creatorAffinityScore,
          genrePreferenceScore: base.genrePreferenceScore,
          qualityPriorScore: base.qualityPriorScore,
          adjacentDiscoveryScore: novelty.adjacentDiscoveryScore,
          clonePenaltyReverseScore: novelty.clonePenaltyReverseScore,
          retrievalSupportScore: movie.retrievalTrace.retrievalSupportScore,
          retrievalChannelCount: movie.retrievalTrace.channels.length,
        },
        trace,
      };
    })
    .sort((a, b) => b.preRerankScore - a.preRerankScore);

  const diversified = rerankTopPicks(scored, 3);

  return diversified.map((entry, index) => {
    const rank = (index + 1) as 1 | 2 | 3;
    const reasonText = generateRecommendationReason({
      mbti: args.selectedMbti,
      currentMood: args.selectedMood,
      likedMovies: likedTitles,
      rejectedMovies: rejectedTitles,
      recommendedMovie: {
        title: entry.movie.title,
        genres: [entry.movie.genrePrimary, entry.movie.genreSecondary].filter((value): value is string => Boolean(value)),
        matchedFeatures: entry.trace.matchedFeatures as FeatureDimension[],
        scoreBreakdown: {
          knownTasteScore: entry.breakdown.knownTasteScore,
          currentMoodScore: entry.breakdown.currentMoodScore,
          mbtiAdjustmentScore: entry.breakdown.mbtiAdjustmentScore,
        },
      },
    });

    const secondaryReason =
      entry.breakdown.creatorAffinityScore >= 0.6
        ? { type: "director_match" as const, text: "好みの監督・俳優との一致が高く、満足度が安定しやすい候補です。" }
        : entry.breakdown.genrePreferenceScore >= 0.72
          ? { type: "genre_match" as const, text: "好きなジャンルに一致しており、あなたの嗜好に寄せた提案です。" }
        : entry.breakdown.watchContextScore >= 0.66
          ? { type: "context_match" as const, text: `${args.contextInput.watchingWith} の視聴文脈に合いやすい作品です。` }
          : { type: "review_match" as const, text: "レビュー評価の下支えがあり、外しにくい候補です。" };

    const tertiaryReason =
      entry.breakdown.adjacentDiscoveryScore >= 0.75
        ? {
            type: "style_match" as const,
            text: "好みに隣接した領域から選び、既視感を抑えた提案にしています。",
          }
        : {
            type: "style_match" as const,
            text: `一致特徴: ${entry.trace.matchedFeatures.slice(0, 3).join(", ")}`,
          };

    return {
      rank,
      movieId: entry.movie.id,
      title: entry.movie.title,
      score: entry.totalScore,
      confidenceLabel: toConfidenceLabel(entry.totalScore),
      reasons: [
        { type: "mood_match", text: reasonText },
        secondaryReason,
        tertiaryReason,
      ],
      breakdown: entry.breakdown,
      trace: entry.trace,
    };
  });
}
