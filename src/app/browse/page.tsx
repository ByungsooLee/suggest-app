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
    take: 500,
    select: {
      id: true,
      title: true,
      releaseYear: true,
      genrePrimary: true,
      posterUrl: true,
      directors: true,
      reviewScore: true,
      localizedTitles: true,
      localizedData: true,
    },
  });

  return (
    <main className="film-grain min-h-screen bg-[var(--color-bg-void)]">
      <CreditsBrowser movies={movies} genres={[...MOVIE_GENRES]} />
    </main>
  );
}
