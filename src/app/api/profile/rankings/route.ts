import { requireUser } from "@/lib/auth/require-user";
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
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;

  const watched = await prisma.userWatchedMovie.findMany({
    where: { userId: authResult.userId },
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

  const watchedCount = watched.length;
  const unlocked = watchedCount >= UNLOCK_THRESHOLD;
  const directors = unlocked ? rankNames(watched.map((item) => item.movie.directors)) : [];
  const actors = unlocked ? rankNames(watched.map((item) => item.movie.cast)) : [];

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
