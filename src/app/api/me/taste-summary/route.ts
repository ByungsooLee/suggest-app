import { getAppUserId } from "@/lib/auth/app-user";
import { prisma } from "@/lib/db/prisma";
import { buildTasteSummary } from "@/lib/mypage/taste-summary";

export async function GET() {
  const userId = await getAppUserId();
  const [watched, preferences] = await Promise.all([
    prisma.userWatchedContent.findMany({
      where: { userId },
      include: {
        movie: {
          select: { genrePrimary: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 800,
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        favoriteGenres: true,
        preferredDirectors: true,
        preferredActors: true,
      },
    }),
  ]);

  return Response.json(
    buildTasteSummary({
      watched,
      preferences: {
        favoriteGenres: preferences?.favoriteGenres ?? [],
        preferredDirectors: preferences?.preferredDirectors ?? [],
        preferredActors: preferences?.preferredActors ?? [],
      },
    }),
    { status: 200 },
  );
}
