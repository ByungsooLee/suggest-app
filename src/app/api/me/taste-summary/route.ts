import { requireUser } from "@/lib/auth/require-user";
import { type UserWatchedContent } from "@prisma/client";
import { isMissingUserWatchedContentTableError } from "@/lib/db/prisma-compat";
import { prisma } from "@/lib/db/prisma";
import { buildTasteSummary } from "@/lib/mypage/taste-summary";

export async function GET() {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;

  let watched: Array<UserWatchedContent & { movie: { genrePrimary: string } | null }> = [];
  try {
    watched = await prisma.userWatchedContent.findMany({
      where: { userId: authResult.userId },
      include: {
        movie: {
          select: {
            genrePrimary: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 800,
    });
  } catch (error) {
    if (!isMissingUserWatchedContentTableError(error)) throw error;
    const legacy = await prisma.userWatchedMovie.findMany({
      where: { userId: authResult.userId },
      include: {
        movie: {
          select: {
            genrePrimary: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 800,
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
  const preferences = await prisma.user.findUnique({
    where: { id: authResult.userId },
    select: {
      favoriteGenres: true,
      preferredDirectors: true,
      preferredActors: true,
    },
  });

  const summary = buildTasteSummary({
    watched,
    preferences: {
      favoriteGenres: preferences?.favoriteGenres ?? [],
      preferredDirectors: preferences?.preferredDirectors ?? [],
      preferredActors: preferences?.preferredActors ?? [],
    },
  });

  return Response.json(summary, { status: 200 });
}
