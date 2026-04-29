import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import type { DiscoverMovie } from "@/components/discover/DiscoverSwipeCard";
import { movieCardSelect } from "@/lib/db/selects/movie";
import { prisma } from "@/lib/db/prisma";
import { mapCreditsToPersonChipData } from "@/lib/movies/credits";
import { createMovieCardPayload } from "@/lib/movies/movie-card";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10", 10), 30);
  const excludeParam = searchParams.get("exclude") ?? "";
  const excludeIds = excludeParam ? excludeParam.split(",").filter(Boolean) : [];

  const profile = await prisma.userMovieProfile.findUnique({
    where: { userId: session.user.id },
    select: { genreWeights: true },
  });

  const genreWeights = (profile?.genreWeights ?? {}) as Record<string, number>;

  // Top preferred genres (weight > 0.5)
  const preferredGenres = Object.entries(genreWeights)
    .filter(([, w]) => w > 0.5)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([g]) => g);

  const biasedCount = Math.round(limit * 0.7);
  const randomCount = limit - biasedCount;

  const [biased, random] = await Promise.all([
    preferredGenres.length > 0
      ? prisma.movie.findMany({
          where: {
            id: { notIn: excludeIds },
            genrePrimary: { in: preferredGenres },
          },
          orderBy: { reviewScore: "desc" },
          take: biasedCount * 3,
          select: movieCardSelect,
        })
      : Promise.resolve([]),
    prisma.movie.findMany({
      where: { id: { notIn: excludeIds } },
      orderBy: [{ reviewScore: "desc" }],
      skip: Math.floor(Math.random() * 50),
      take: randomCount * 3,
      select: movieCardSelect,
    }),
  ]);

  // Shuffle biased pool and pick
  const shuffledBiased = biased.sort(() => Math.random() - 0.5).slice(0, biasedCount);
  const shuffledRandom = random
    .filter((m) => !shuffledBiased.some((b) => b.id === m.id))
    .sort(() => Math.random() - 0.5)
    .slice(0, randomCount);

  const combined = [...shuffledBiased, ...shuffledRandom].sort(() => Math.random() - 0.5);

  const result: DiscoverMovie[] = combined.map((m) =>
    createMovieCardPayload({
      id: m.id,
      title: m.title,
      releaseYear: m.releaseYear,
      genrePrimary: m.genrePrimary,
      directors: m.directors,
      posterUrl: m.posterUrl,
      runtimeMinutes: m.runtimeMinutes,
      reviewScore: m.reviewScore,
      overview: m.overview,
      cast: m.cast,
      localizedTitles: m.localizedTitles,
      localizedData: m.localizedData,
      credits: mapCreditsToPersonChipData({
        credits: m.credits,
        directors: m.directors,
        cast: m.cast,
      }),
    }),
  );

  return NextResponse.json(result);
}
