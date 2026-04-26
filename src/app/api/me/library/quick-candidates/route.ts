import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db/prisma";
import { selectQuickCandidates } from "@/lib/library/quick-candidate-strategy";

const DEFAULT_LIMIT = 12;

export async function GET(request: Request) {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;

  const { searchParams } = new URL(request.url);
  const limitRaw = Number(searchParams.get("limit") ?? String(DEFAULT_LIMIT));
  const limit = Number.isFinite(limitRaw) ? Math.max(6, Math.min(limitRaw, 24)) : DEFAULT_LIMIT;
  const cursorRaw = Number(searchParams.get("cursor") ?? "0");
  const cursor = Number.isFinite(cursorRaw) && cursorRaw >= 0 ? cursorRaw : 0;

  const [watched, quickLogs, onboardingReactions, movies] = await Promise.all([
    prisma.userWatchedContent.findMany({
      where: { userId: authResult.userId, movieId: { not: null } },
      select: { movieId: true, reaction: true },
      take: 2000,
    }),
    prisma.quickReactionLog.findMany({
      where: { userId: authResult.userId },
      orderBy: { createdAt: "desc" },
      select: { movieId: true },
      take: 1000,
    }),
    prisma.onboardingMovieReaction.findMany({
      where: { userId: authResult.userId },
      include: { movie: true },
    }),
    prisma.movie.findMany({
      orderBy: [{ reviewScore: "desc" }, { releaseYear: "desc" }],
      skip: cursor,
      take: 500,
      select: {
        id: true,
        title: true,
        releaseYear: true,
        posterUrl: true,
        overview: true,
        genrePrimary: true,
        directors: true,
        cast: true,
        reviewScore: true,
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
    }),
  ]);

  const excludedMovieIds = new Set<string>();
  for (const item of watched) {
    if (item.movieId) excludedMovieIds.add(item.movieId);
  }
  for (const log of quickLogs) {
    excludedMovieIds.add(log.movieId);
  }

  const reactionSeedMovieIds = watched.map((item) => item.movieId).filter((id): id is string => Boolean(id));
  const seedMovies = reactionSeedMovieIds.length
    ? await prisma.movie.findMany({
        where: { id: { in: reactionSeedMovieIds } },
        select: {
          id: true,
          title: true,
          releaseYear: true,
          posterUrl: true,
          overview: true,
          genrePrimary: true,
          directors: true,
          cast: true,
          reviewScore: true,
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
      })
    : [];
  const seedMovieById = new Map(seedMovies.map((movie) => [movie.id, movie]));

  const likedSeedMovies = [
    ...onboardingReactions
      .filter((item) => item.reactionType === "liked")
      .map((item) => item.movie),
    ...watched
      .filter((item) => item.reaction === "like")
      .map((item) => seedMovieById.get(item.movieId ?? ""))
      .filter((movie): movie is NonNullable<typeof movie> => Boolean(movie)),
  ];
  const rejectedSeedMovies = [
    ...onboardingReactions
      .filter((item) => item.reactionType === "not_for_me")
      .map((item) => item.movie),
    ...watched
      .filter((item) => item.reaction === "dislike")
      .map((item) => seedMovieById.get(item.movieId ?? ""))
      .filter((movie): movie is NonNullable<typeof movie> => Boolean(movie)),
  ];

  const selected = selectQuickCandidates({
    userId: authResult.userId,
    movies,
    excludedMovieIds,
    likedSeedMovies,
    rejectedSeedMovies,
    limit,
  });

  const nextCursor = movies.length >= 500 ? String(cursor + 500) : null;
  return Response.json({ ...selected, nextCursor }, { status: 200 });
}
