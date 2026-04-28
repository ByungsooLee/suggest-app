import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { DiscoverClient } from "./discover-client";

export default async function DiscoverPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [swipedIds, profile] = await Promise.all([
    prisma.movieSwipe.findMany({
      where: { userId: session.user.id },
      select: { movieId: true },
    }),
    prisma.userMovieProfile.findUnique({
      where: { userId: session.user.id },
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
