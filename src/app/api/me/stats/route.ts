import { getAppUserId } from "@/lib/auth/app-user";
import { prisma } from "@/lib/db/prisma";
import { buildPersonalStats } from "@/lib/mypage/stats";

export async function GET() {
  const userId = await getAppUserId();
  const [watched, watchlist] = await Promise.all([
    prisma.userWatchedContent.findMany({
      where: { userId },
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
    }),
    prisma.userWatchlistItem.findMany({
      where: { userId },
    }),
  ]);

  return Response.json(buildPersonalStats({ watched, watchlist }), { status: 200 });
}
