import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const trending = await prisma.movie.findMany({
    orderBy: [{ reviewScore: "desc" }, { releaseYear: "desc" }],
    take: 12,
    select: { id: true, title: true, releaseYear: true, genrePrimary: true, posterUrl: true, directors: true, reviewScore: true, moodTags: true, watchContexts: true, runtimeMinutes: true, overview: true },
  });

  const soloMovies = await prisma.movie.findMany({
    where: { watchContexts: { has: "solo_watch" }, reviewScore: { gte: 7.5 } },
    orderBy: { reviewScore: "desc" }, take: 6,
    select: { id: true, title: true, posterUrl: true, reviewScore: true, genrePrimary: true, releaseYear: true },
  });
  const dateMovies = await prisma.movie.findMany({
    where: { watchContexts: { has: "date_friendly" }, reviewScore: { gte: 7.2 } },
    orderBy: { reviewScore: "desc" }, take: 6,
    select: { id: true, title: true, posterUrl: true, reviewScore: true, genrePrimary: true, releaseYear: true },
  });
  const friendsMovies = await prisma.movie.findMany({
    where: { watchContexts: { has: "friends_hangout" }, reviewScore: { gte: 7.0 } },
    orderBy: { reviewScore: "desc" }, take: 6,
    select: { id: true, title: true, posterUrl: true, reviewScore: true, genrePrimary: true, releaseYear: true },
  });
  const darkMovies = await prisma.movie.findMany({
    where: { moodTags: { hasSome: ["dark", "tense"] }, reviewScore: { gte: 7.5 } },
    orderBy: { reviewScore: "desc" }, take: 6,
    select: { id: true, title: true, posterUrl: true, reviewScore: true, genrePrimary: true, releaseYear: true, moodTags: true },
  });
  const uplifting = await prisma.movie.findMany({
    where: { moodTags: { hasSome: ["uplifting", "funny"] }, reviewScore: { gte: 7.0 } },
    orderBy: { reviewScore: "desc" }, take: 6,
    select: { id: true, title: true, posterUrl: true, reviewScore: true, genrePrimary: true, releaseYear: true, moodTags: true },
  });

  const introspective = await prisma.movie.findMany({
    where: { moodCalm: { gte: 0.6 }, moodEmotional: { gte: 0.6 }, reviewScore: { gte: 7.5 } },
    orderBy: { reviewScore: "desc" }, take: 4,
    select: { id: true, title: true, posterUrl: true, reviewScore: true, genrePrimary: true, releaseYear: true },
  });
  const energetic = await prisma.movie.findMany({
    where: { moodUplifting: { gte: 0.7 }, toneFunny: { gte: 0.5 }, reviewScore: { gte: 7.0 } },
    orderBy: { reviewScore: "desc" }, take: 4,
    select: { id: true, title: true, posterUrl: true, reviewScore: true, genrePrimary: true, releaseYear: true },
  });
  const analytical = await prisma.movie.findMany({
    where: { complexity: { gte: 0.65 }, toneStylish: { gte: 0.65 }, reviewScore: { gte: 7.8 } },
    orderBy: { reviewScore: "desc" }, take: 4,
    select: { id: true, title: true, posterUrl: true, reviewScore: true, genrePrimary: true, releaseYear: true },
  });
  const feelers = await prisma.movie.findMany({
    where: { emotionalWeight: { gte: 0.7 }, moodEmotional: { gte: 0.7 }, reviewScore: { gte: 7.2 } },
    orderBy: { reviewScore: "desc" }, take: 4,
    select: { id: true, title: true, posterUrl: true, reviewScore: true, genrePrimary: true, releaseYear: true },
  });

  let userRecentMoods: Array<{ mood: string; movies: typeof soloMovies }> = [];
  if (userId) {
    const recentSessions = await prisma.recommendationSession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        results: {
          include: {
            movie: { select: { id: true, title: true, posterUrl: true, reviewScore: true, genrePrimary: true, releaseYear: true } },
          },
          orderBy: { rank: "asc" },
          take: 3,
        },
      },
    });
    const moodGroups = new Map<string, typeof soloMovies>();
    for (const session of recentSessions) {
      const key = session.currentMoods.slice(0, 2).join("+") || session.watchingWith;
      if (!moodGroups.has(key)) {
        moodGroups.set(key, session.results.map((r) => r.movie));
      }
    }
    userRecentMoods = [...moodGroups.entries()].slice(0, 3).map(([mood, movies]) => ({ mood, movies }));
  }

  const totalMovies = await prisma.movie.count();
  const totalUsers = await prisma.user.count();

  return Response.json({
    trending,
    contextPicks: { solo: soloMovies, date: dateMovies, friends: friendsMovies },
    moodPicks: { dark: darkMovies, uplifting },
    mbtiShowcase: { IN: introspective, EN: energetic, xNTx: analytical, xNFx: feelers },
    userRecentMoods,
    stats: { totalMovies, totalUsers },
  });
}
