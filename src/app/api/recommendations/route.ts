import { recommendMovies } from "@/lib/recommendation/engine";
import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db/prisma";
import { resolveStrictMoviePoster } from "@/lib/movies/strict-movie-poster-match";
import { parseJson } from "@/lib/validation/http";
import { RecommendationsRequestSchema } from "@/lib/validation/schemas";

const mergeUniqueNames = (values: string[]) =>
  Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );

export async function POST(request: Request) {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;

  const parsed = await parseJson(request, RecommendationsRequestSchema);
  if (!parsed.ok) return parsed.response;

  const tasteProfile = await prisma.userTasteProfile.findFirst({
    where: { userId: authResult.userId },
    orderBy: { createdAt: "desc" },
  });

  if (!tasteProfile) {
    return Response.json(
      {
        code: "TASTE_PROFILE_MISSING",
        message: "Taste profile is missing. Complete onboarding or rebuild profile.",
      },
      { status: 409 },
    );
  }

  const movies = await prisma.movie.findMany();
  const userPreferences = await prisma.user.findUnique({
    where: { id: authResult.userId },
    select: {
      favoriteGenres: true,
      excludedGenres: true,
      preferredDirectors: true,
      preferredActors: true,
      discoveryMode: true,
    },
  });

  const recommendations = recommendMovies({
    movies,
    tasteProfile,
    contextInput: {
      currentMoods: parsed.data.currentMoods,
      desiredRuntimeMin: parsed.data.desiredRuntimeMin,
      desiredRuntimeMax: parsed.data.desiredRuntimeMax,
      watchingWith: parsed.data.watchingWith,
      excludeContentWarnings: parsed.data.excludeContentWarnings,
      excludeTags: parsed.data.excludeTags,
      favoriteGenres: userPreferences?.favoriteGenres ?? [],
      excludedGenres: userPreferences?.excludedGenres ?? [],
      preferredDirectors: mergeUniqueNames([...(userPreferences?.preferredDirectors ?? []), ...parsed.data.preferredDirectors]),
      preferredActors: mergeUniqueNames([...(userPreferences?.preferredActors ?? []), ...parsed.data.preferredActors]),
      minimumReviewScore: parsed.data.minimumReviewScore,
      discoveryMode: (userPreferences?.discoveryMode as "focused" | "balanced" | "wide" | null) ?? "balanced",
    },
  });
  const movieById = new Map(movies.map((movie) => [movie.id, movie]));
  const recommendedMovieIds = new Set(recommendations.map((item) => item.movieId));
  const missingPosterMovies = [...recommendedMovieIds]
    .map((movieId) => movieById.get(movieId))
    .filter((movie): movie is (typeof movies)[number] => movie !== undefined && !movie.posterUrl);

  if (missingPosterMovies.length > 0) {
    const posterMatches = await Promise.all(
      missingPosterMovies.map(async (movie) => ({
        movie,
        match: await resolveStrictMoviePoster({
          title: movie.title,
          releaseYear: movie.releaseYear,
        }),
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
      tasteProfileId: tasteProfile.id,
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

  await prisma.recommendationResult.createMany({
    data: recommendations.map((item) => ({
      sessionId: session.id,
      movieId: item.movieId,
      rank: item.rank,
      totalScore: item.breakdown.totalScore,
      moodMatchScore: item.breakdown.moodMatchScore,
      contextMatchScore: item.breakdown.contextMatchScore,
      runtimeFitScore: item.breakdown.runtimeFitScore,
      styleMatchScore: item.breakdown.styleMatchScore,
      reason1: item.reasons[0]?.text ?? "総合バランスが今夜向きの1本です。",
      reason2: item.reasons[1]?.text,
      reason3: item.reasons[2]?.text,
    })),
  });

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
