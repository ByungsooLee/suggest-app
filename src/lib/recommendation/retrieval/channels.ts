import { ADJACENT_DISCOVERY_BAND, RETRIEVAL_CHANNEL_QUOTAS, RETRIEVAL_THRESHOLDS } from "@/lib/recommendation/constants";
import { type WatchContext } from "@/lib/constants/taxonomy";
import { type CandidateMovie, type RetrievalCandidate, type RetrievalChannel } from "@/lib/recommendation/types";
import { type FeatureVector, clamp01, cosineSimilarity, extractMovieVector } from "@/lib/recommendation/feature-vector";
import { computeCreatorAffinity, computeQualityPrior, computeWatchContextScore } from "@/lib/recommendation/score-base";

export type ChannelContext = {
  movies: CandidateMovie[];
  knownTasteVector: FeatureVector | null;
  moodVector: FeatureVector;
};

function buildScoredCandidates(args: {
  channel: RetrievalChannel;
  movies: CandidateMovie[];
  scoreOf: (movie: CandidateMovie, vector: FeatureVector) => number | null;
}): RetrievalCandidate[] {
  return args.movies
    .map((movie) => {
      const vector = extractMovieVector(movie);
      const score = args.scoreOf(movie, vector);
      if (score == null) return null;
      return {
        movie,
        vector,
        channel: args.channel,
        channelScore: score,
        channelRank: 0,
      } satisfies RetrievalCandidate;
    })
    .filter((value): value is RetrievalCandidate => Boolean(value))
    .sort((a, b) => b.channelScore - a.channelScore)
    .map((entry, index) => ({
      ...entry,
      channelRank: index + 1,
    }));
}

function scoreTasteSimilarity(knownTasteVector: FeatureVector | null, candidateVector: FeatureVector): number | null {
  if (!knownTasteVector) return null;
  return cosineSimilarity(knownTasteVector, candidateVector);
}

function scoreAdjacentBand(distance: number): number {
  const { minDistance, maxDistance, falloff, tooFarStart } = ADJACENT_DISCOVERY_BAND;
  if (distance < minDistance) {
    return clamp01(1 - (minDistance - distance) / falloff);
  }
  if (distance <= maxDistance) {
    return 1;
  }
  if (distance >= tooFarStart) {
    return clamp01(1 - (distance - tooFarStart) / (1 - tooFarStart));
  }
  return clamp01(1 - (distance - maxDistance) / falloff);
}

export function retrieveTasteNearest(context: ChannelContext) {
  const scored = buildScoredCandidates({
    channel: "taste_nearest",
    movies: context.movies,
    scoreOf: (_movie, vector) => scoreTasteSimilarity(context.knownTasteVector, vector),
  });
  return scored.slice(0, RETRIEVAL_CHANNEL_QUOTAS.taste_nearest);
}

export function retrieveMoodCompatible(context: ChannelContext) {
  const scored = buildScoredCandidates({
    channel: "mood_compatible",
    movies: context.movies,
    scoreOf: (_movie, vector) => {
      const moodScore = cosineSimilarity(context.moodVector, vector);
      if (moodScore < RETRIEVAL_THRESHOLDS.moodMinimum) return null;
      return moodScore;
    },
  });
  return scored.slice(0, RETRIEVAL_CHANNEL_QUOTAS.mood_compatible);
}

export function retrieveWatchContext(context: ChannelContext & { watchingWith: WatchContext }) {
  const scored = buildScoredCandidates({
    channel: "watch_context",
    movies: context.movies,
    scoreOf: (movie) => {
      const contextFit = computeWatchContextScore(context.watchingWith, movie.watchContexts);
      if (contextFit <= 0) return null;
      return contextFit * 0.75 + computeQualityPrior(movie.reviewScore) * 0.25;
    },
  });
  return scored.slice(0, RETRIEVAL_CHANNEL_QUOTAS.watch_context);
}

export function retrieveCreatorAffinity(
  context: ChannelContext & {
    preferredDirectors: string[];
    preferredActors: string[];
  },
) {
  const scored = buildScoredCandidates({
    channel: "creator_affinity",
    movies: context.movies,
    scoreOf: (movie) => {
      const affinity = computeCreatorAffinity({
        preferredDirectors: context.preferredDirectors,
        preferredActors: context.preferredActors,
        movieDirectors: movie.directors,
        movieCast: movie.cast,
      });
      if (!affinity.active || affinity.score <= 0) return null;
      return affinity.score;
    },
  });
  return scored.slice(0, RETRIEVAL_CHANNEL_QUOTAS.creator_affinity);
}

export function retrieveQualityFit(context: ChannelContext) {
  const scored = buildScoredCandidates({
    channel: "quality_fit",
    movies: context.movies,
    scoreOf: (movie, vector) => {
      const reviewScore = movie.reviewScore ?? 0;
      if (reviewScore < RETRIEVAL_THRESHOLDS.qualityMinimumReview) return null;
      const tasteScore = scoreTasteSimilarity(context.knownTasteVector, vector) ?? 0.5;
      const moodScore = cosineSimilarity(context.moodVector, vector);
      const fitScore = Math.max(tasteScore, moodScore);
      if (fitScore < RETRIEVAL_THRESHOLDS.qualityFitMinimum) return null;
      return computeQualityPrior(reviewScore) * 0.6 + fitScore * 0.4;
    },
  });
  return scored.slice(0, RETRIEVAL_CHANNEL_QUOTAS.quality_fit);
}

export function retrieveAdjacentDiscovery(context: ChannelContext) {
  const scored = buildScoredCandidates({
    channel: "adjacent_discovery",
    movies: context.movies,
    scoreOf: (movie, vector) => {
      const tasteScore = scoreTasteSimilarity(context.knownTasteVector, vector);
      if (tasteScore == null) return null;
      const distance = clamp01(1 - tasteScore);
      if (distance < RETRIEVAL_THRESHOLDS.adjacentMin || distance > RETRIEVAL_THRESHOLDS.adjacentMax) return null;
      const adjacent = scoreAdjacentBand(distance);
      return adjacent * 0.7 + computeQualityPrior(movie.reviewScore) * 0.3;
    },
  });
  return scored.slice(0, RETRIEVAL_CHANNEL_QUOTAS.adjacent_discovery);
}
