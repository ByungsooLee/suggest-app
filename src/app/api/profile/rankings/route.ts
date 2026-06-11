import { getAppUserId } from "@/lib/auth/app-user";
import { prisma } from "@/lib/db/prisma";

const UNLOCK_THRESHOLD = 20;
const RANK_LIMIT = 8;

function rankNames(items: string[][]) {
  const counts = new Map<string, number>();
  for (const names of items) {
    for (const rawName of names) {
      const name = rawName.trim();
      if (!name || name.toLowerCase().startsWith("unknown")) continue;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, RANK_LIMIT)
    .map(([name, count]) => ({ name, count }));
}

export async function GET() {
  const userId = await getAppUserId();
  const watched = await prisma.userWatchedContent.findMany({
    where: { userId, contentType: "movie", movieId: { not: null } },
    include: {
      movie: {
        select: {
          directors: true,
          cast: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 600,
  });

  const withMovie = watched.filter((item) => item.movie != null);
  const watchedCount = withMovie.length;
  const unlocked = watchedCount >= UNLOCK_THRESHOLD;
  const directors = unlocked ? rankNames(withMovie.map((item) => item.movie!.directors)) : [];
  const actors = unlocked ? rankNames(withMovie.map((item) => item.movie!.cast)) : [];

  return Response.json(
    {
      watchedCount,
      threshold: UNLOCK_THRESHOLD,
      unlocked,
      remainingCount: Math.max(0, UNLOCK_THRESHOLD - watchedCount),
      directors,
      actors,
    },
    { status: 200 },
  );
}
