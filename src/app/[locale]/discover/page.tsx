import { getAppUserId } from "@/lib/auth/app-user";
import { prisma } from "@/lib/db/prisma";
import { DiscoverClient } from "./discover-client";

export default async function DiscoverPage() {
  const userId = await getAppUserId();

  const [swipedIds, profile] = await Promise.all([
    prisma.movieSwipe.findMany({
      where: { userId },
      select: { movieId: true },
    }),
    prisma.userMovieProfile.findUnique({
      where: { userId },
    }),
  ]);

  return (
    <DiscoverClient
      swipedMovieIds={swipedIds.map((s) => s.movieId)}
      totalSwipes={profile?.totalSwipes ?? 0}
      personalityLabel={profile?.personalityLabel ?? null}
    />
  );
}
