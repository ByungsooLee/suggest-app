import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { MOVIE_GENRES, MOOD_TAGS } from "@/lib/constants/taxonomy";
import { DiscoverClient } from "./discover-client";

export default async function DiscoverPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const movies = await prisma.movie.findMany({
    orderBy: [{ reviewScore: "desc" }],
    take: 100,
    select: {
      id: true,
      title: true,
      releaseYear: true,
      genrePrimary: true,
      directors: true,
      reviewScore: true,
      moodTags: true,
      runtimeMinutes: true,
    },
  });

  return (
    <main className="film-grain min-h-screen bg-[var(--color-bg-void)]">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="credits-label mb-3">DISCOVER</p>
        <h1 className="credits-name-lg mb-10">映画を探す</h1>
        <DiscoverClient
          movies={movies}
          genres={[...MOVIE_GENRES]}
          moodTags={[...MOOD_TAGS]}
        />
      </div>
    </main>
  );
}
