import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { MOVIE_GENRES } from "@/lib/constants/taxonomy";
import { CreditsBrowser } from "./credits-browser";

export default async function BrowsePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const movies = await prisma.movie.findMany({
    orderBy: [{ reviewScore: "desc" }],
    take: 200,
    select: {
      id: true,
      title: true,
      releaseYear: true,
      genrePrimary: true,
      posterUrl: true,
      directors: true,
      reviewScore: true,
    },
  });

  return (
    <main className="film-grain min-h-screen bg-[var(--color-bg-void)]">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-[var(--color-bg-void)] to-transparent" />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t from-[var(--color-bg-void)] to-transparent" />
      <CreditsBrowser movies={movies} genres={[...MOVIE_GENRES]} />
    </main>
  );
}
