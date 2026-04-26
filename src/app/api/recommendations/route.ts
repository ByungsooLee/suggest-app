import { recommendMovies } from "@/lib/recommendation/engine";
import { Prisma } from "@prisma/client";
import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db/prisma";
import { resolveStrictMoviePoster } from "@/lib/movies/strict-movie-poster-match";
import { REPETITION_CONTROL } from "@/lib/recommendation/constants";
import { parseJson } from "@/lib/validation/http";
import { RecommendationsRequestSchema } from "@/lib/validation/schemas";

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T | null> {
  let timer: NodeJS.Timeout | null = null;
  try {
    const timeoutPromise = new Promise<null>((resolve) => {
      timer = setTimeout(() => resolve(null), timeoutMs);
    });
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function mergeUnique(values: string[][]): string[] {
  const normalized = new Set<string>();
  const result: string[] = [];
  for (const list of values) {
    for (const rawValue of list) {
      const value = rawValue.trim();
      if (!value) continue;
      const key = value.toLowerCase();
      if (normalized.has(key)) continue;
      normalized.add(key);
      result.push(value);
    }
  }
  return result;
}

export async function POST(request: Request) {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;

  const parsed = await parseJson(request, RecommendationsRequestSchema);
  if (!parsed.ok) return parsed.response;

  const onboardingProfile = await prisma.userOnboardingProfile.findFirst({
    where: { userId: authResult.userId },
    orderBy: { updatedAt: "desc" },
    select: { mbtiType: true, selectedMood: true },
  });

  if (!onboardingProfile?.selectedMood) {
    return Response.json(
      {
        code: "ONBOARDING_PROFILE_MISSING",
        message: "Onboarding profile is missing. Complete onboarding first.",
      },
      { status: 409 },
    );
  }

  let userPreferences:
    | {
        favoriteGenres: string[];
        preferredDirectors: string[];
        preferredActors: string[];
        useFavoritesInRecommendations: boolean;
        preferenceInfluenceStrength: "light" | "balanced" | "strong";
        recommendationStyleMode: "safe" | "balanced" | "discovery_focused";
      }
    | null = null;
  try {
    userPreferences = await prisma.user.findUnique({
      where: { id: authResult.userId },
      select: {
        favoriteGenres: true,
        preferredDirectors: true,
        preferredActors: true,
        useFavoritesInRecommendations: true,
        preferenceInfluenceStrength: true,
        recommendationStyleMode: true,
      },
    });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientValidationError)) throw error;
    const legacyPrefs = await prisma.user.findUnique({
      where: { id: authResult.userId },
      select: {
        favoriteGenres: true,
        preferredDirectors: true,
        preferredActors: true,
      },
    });
    userPreferences = legacyPrefs
      ? {
          ...legacyPrefs,
          useFavoritesInRecommendations: true,
          preferenceInfluenceStrength: "balanced",
          recommendationStyleMode: "balanced",
        }
      : null;
  }

  const [watchedContentRows, legacyWatchedMovieIds] = await Promise.all([
    prisma.userWatchedContent
      .findMany({
        where: { userId: authResult.userId, contentType: "movie", movieId: { not: null } },
        select: { movieId: true, reaction: true, catalogSource: true },
        take: 1000,
      })
      .catch((error) => {
        const isMissingTable =
          error instanceof Prisma.PrismaClientKnownRequestError && (error.code === "P2021" || error.code === "P2022");
        if (isMissingTable) return [] as Array<{ movieId: string | null; reaction: "like" | "normal" | "dislike" | null; catalogSource: string }>;
        throw error;
      }),
    prisma.userWatchedMovie
      .findMany({
        where: { userId: authResult.userId },
        select: { movieId: true },
        take: 1000,
      })
      .then((items) => items.map((item) => item.movieId)),
  ]);
  const watchedContentMovieIds = watchedContentRows.map((item) => item.movieId).filter((id): id is string => Boolean(id));

  const onboardingReactions = await prisma.onboardingMovieReaction.findMany({
    where: { userId: authResult.userId },
    include: {
      movie: true,
    },
  });
  const movies = await prisma.movie.findMany({
    select: {
      id: true,
      title: true,
      genrePrimary: true,
      genreSecondary: true,
      runtimeMinutes: true,
      contentWarnings: true,
      moodTags: true,
      watchContexts: true,
      directors: true,
      cast: true,
      reviewScore: true,
      reviewSummary: true,
      posterUrl: true,
      overview: true,
      releaseYear: true,
      moodCalm: true,
      moodDark: true,
      moodEmotional: true,
      moodUplifting: true,
      toneStylish: true,
      toneFunny: true,
      paceFast: true,
      paceSlowBurn: true,
      complexity: true,
      emotionalWeight: true,
      tension: true,
      accessibility: true,
    },
    orderBy: [{ releaseYear: "desc" }, { title: "asc" }],
  });
  const recentSessions = await prisma.recommendationSession.findMany({
    where: { userId: authResult.userId },
    orderBy: { createdAt: "desc" },
    take: REPETITION_CONTROL.maxSessions,
    include: {
      results: {
        orderBy: { rank: "asc" },
        select: { movieId: true },
      },
    },
  });
  const movieById = new Map(movies.map((movie) => [movie.id, movie]));
  const watchedSignalReactions = watchedContentRows
    .map((item) => {
      if (!item.movieId || !item.reaction) return null;
      const movie = movieById.get(item.movieId);
      if (!movie) return null;
      if (item.reaction === "like") {
        return {
          reactionType: "liked" as const,
          movie,
          signalWeight: item.catalogSource === "quick_classify" ? 0.45 : 0.65,
        };
      }
      if (item.reaction === "dislike") {
        return {
          reactionType: "not_for_me" as const,
          movie,
          signalWeight: item.catalogSource === "quick_classify" ? 0.5 : 0.75,
        };
      }
      return {
        reactionType: "dont_know" as const,
        movie,
        signalWeight: 0.2,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  const recommendations = recommendMovies({
    movies,
    reactions: [
      ...onboardingReactions.map((reaction) => ({
        reactionType: reaction.reactionType,
        movie: reaction.movie,
        signalWeight: 1,
      })),
      ...watchedSignalReactions,
    ],
    selectedMood: onboardingProfile.selectedMood,
    selectedMbti: onboardingProfile.mbtiType,
    recentSessions: recentSessions.map((session) => ({
      movieIdsByRank: session.results.map((result) => result.movieId),
    })),
    contextInput: {
      currentMoods: parsed.data.currentMoods,
      desiredRuntimeMin: parsed.data.desiredRuntimeMin,
      desiredRuntimeMax: parsed.data.desiredRuntimeMax,
      watchingWith: parsed.data.watchingWith,
      excludeContentWarnings: parsed.data.excludeContentWarnings,
      excludeTags: parsed.data.excludeTags,
      watchedMovieIds: mergeUnique([watchedContentMovieIds, legacyWatchedMovieIds]),
      useFavoritesInRecommendations: userPreferences?.useFavoritesInRecommendations ?? true,
      influenceStrength: userPreferences?.preferenceInfluenceStrength ?? "balanced",
      recommendationStyleMode: userPreferences?.recommendationStyleMode ?? "balanced",
      preferredGenres: mergeUnique([userPreferences?.favoriteGenres ?? [], parsed.data.preferredGenres]),
      preferredDirectors: mergeUnique([userPreferences?.preferredDirectors ?? [], parsed.data.preferredDirectors]),
      preferredActors: mergeUnique([userPreferences?.preferredActors ?? [], parsed.data.preferredActors]),
      minimumReviewScore: parsed.data.minimumReviewScore,
    },
  });
  const recommendedMovieIds = new Set(recommendations.map((item) => item.movieId));
  const missingPosterMovies = [...recommendedMovieIds]
    .map((movieId) => movieById.get(movieId))
    .filter((movie): movie is (typeof movies)[number] => movie !== undefined && !movie.posterUrl);

  if (missingPosterMovies.length > 0) {
    const posterMatches = await Promise.all(
      missingPosterMovies.map(async (movie) => ({
        movie,
        match:
          (await withTimeout(
            resolveStrictMoviePoster({
              title: movie.title,
              releaseYear: movie.releaseYear,
            }),
            2500,
          )) ?? { matched: false as const, posterUrl: null },
      })),
    );

    await Promise.all(
      posterMatches.map(async ({ movie, match }) => {
        if (!match.matched || !match.posterUrl) return;
        await prisma.movie.update({
          where: { id: movie.id },
          data: { posterUrl: match.posterUrl },
        });
        movieById.set(movie.id, {
          ...movie,
          posterUrl: match.posterUrl,
        });
      }),
    );
  }

  const session = await prisma.recommendationSession.create({
    data: {
      userId: authResult.userId,
      tasteProfileId: null,
      status: recommendations.length === 0 ? "empty" : "completed",
      currentMoods: parsed.data.currentMoods,
      desiredRuntimeMin: parsed.data.desiredRuntimeMin,
      desiredRuntimeMax: parsed.data.desiredRuntimeMax,
      watchingWith: parsed.data.watchingWith,
      excludeContentWarnings: parsed.data.excludeContentWarnings,
      excludeTags: parsed.data.excludeTags,
    },
  });

  if (recommendations.length === 0) {
    return Response.json({
      sessionId: session.id,
      status: "empty",
      topPick: null,
      backups: [],
    });
  }

  const baseResultRows = recommendations.map((item) => ({
    sessionId: session.id,
    movieId: item.movieId,
    rank: item.rank,
    totalScore: item.breakdown.totalScore,
    moodMatchScore: item.breakdown.currentMoodScore,
    contextMatchScore: item.breakdown.watchContextScore,
    runtimeFitScore: item.breakdown.qualityPriorScore,
    styleMatchScore: item.breakdown.noveltyScore,
    knownTasteScore: item.breakdown.knownTasteScore,
    currentMoodScore: item.breakdown.currentMoodScore,
    mbtiAdjustmentScore: item.breakdown.mbtiAdjustmentScore,
    reason1: item.reasons[0]?.text ?? "総合バランスが今夜向きの1本です。",
    reason2: item.reasons[1]?.text,
    reason3: item.reasons[2]?.text,
  }));
  const observabilityRows = recommendations.map((item) => ({
    baseScore: item.breakdown.baseScore,
    discoveryScore: item.breakdown.noveltyScore,
    repetitionPenalty: item.breakdown.repetitionPenalty,
    retrievalSupportScore: item.breakdown.retrievalSupportScore,
    retrievalChannels: item.trace.retrievalChannels,
  }));

  try {
    await prisma.recommendationResult.createMany({
      data: baseResultRows.map((base, index) => ({
        ...base,
        ...observabilityRows[index],
      })),
    });
  } catch (error) {
    // Backward compatibility: if local DB/prisma client has not applied observability columns yet,
    // fall back to legacy columns so recommendation still works.
    const needsLegacyFallback =
      error instanceof Prisma.PrismaClientValidationError ||
      (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2022");

    if (!needsLegacyFallback) throw error;

    await prisma.recommendationResult.createMany({
      data: baseResultRows,
    });
  }

  const [topPick, ...backups] = recommendations;

  return Response.json(
    {
      sessionId: session.id,
      topPick: {
        rank: topPick.rank,
        movieId: topPick.movieId,
        title: topPick.title,
        score: topPick.score,
        confidenceLabel: topPick.confidenceLabel,
        posterUrl: movieById.get(topPick.movieId)?.posterUrl ?? null,
        overview: movieById.get(topPick.movieId)?.overview ?? null,
        directors: movieById.get(topPick.movieId)?.directors ?? [],
        cast: movieById.get(topPick.movieId)?.cast ?? [],
        reviewScore: movieById.get(topPick.movieId)?.reviewScore ?? null,
        reviewSummary: movieById.get(topPick.movieId)?.reviewSummary ?? null,
        reasons: topPick.reasons,
      },
      backups: backups.map((item) => ({
        rank: item.rank,
        movieId: item.movieId,
        title: item.title,
        score: item.score,
        confidenceLabel: item.confidenceLabel,
        posterUrl: movieById.get(item.movieId)?.posterUrl ?? null,
        overview: movieById.get(item.movieId)?.overview ?? null,
        directors: movieById.get(item.movieId)?.directors ?? [],
        cast: movieById.get(item.movieId)?.cast ?? [],
        reviewScore: movieById.get(item.movieId)?.reviewScore ?? null,
        reviewSummary: movieById.get(item.movieId)?.reviewSummary ?? null,
        reasons: item.reasons,
      })),
    },
    { status: 201 },
  );
}
