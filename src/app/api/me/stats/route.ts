import { requireUser } from "@/lib/auth/require-user";
import { type UserWatchedContent } from "@prisma/client";
import { isMissingUserWatchedContentTableError, isMissingUserWatchlistTableError } from "@/lib/db/prisma-compat";
import { prisma } from "@/lib/db/prisma";
import { buildPersonalStats } from "@/lib/mypage/stats";

export async function GET() {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;

  let watched: Array<UserWatchedContent & { movie: { genrePrimary: string; directors: string[]; cast: string[] } | null }> = [];
  try {
    watched = await prisma.userWatchedContent.findMany({
      where: { userId: authResult.userId },
      include: {
        movie: {
          select: {
            genrePrimary: true,
            directors: true,
            cast: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 1000,
    });
  } catch (error) {
    if (!isMissingUserWatchedContentTableError(error)) throw error;
    const legacy = await prisma.userWatchedMovie.findMany({
      where: { userId: authResult.userId },
      include: {
        movie: {
          select: {
            genrePrimary: true,
            directors: true,
            cast: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 1000,
    });
    watched = legacy.map((item) => ({
      id: item.id,
      userId: item.userId,
      contentType: "movie",
      title: "",
      posterUrl: null,
      watched: true,
      movieId: item.movieId,
      source: "manual",
      watchSource: null,
      watchedAt: item.createdAt,
      ratingScore: null,
      reaction: null,
      memo: null,
      rewatch: false,
      catalogSource: "onboarding",
      quickConfidence: null,
      createdAt: item.createdAt,
      updatedAt: item.createdAt,
      movie: item.movie,
    }));
  }
  let watchlist: Awaited<ReturnType<typeof prisma.userWatchlistItem.findMany>> = [];
  try {
    watchlist = await prisma.userWatchlistItem.findMany({
      where: { userId: authResult.userId },
    });
  } catch (error) {
    if (!isMissingUserWatchlistTableError(error)) throw error;
  }

  const stats = buildPersonalStats({ watched, watchlist });
  return Response.json(stats, { status: 200 });
}
