import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import type { LocalizedData } from "@/lib/i18n/lang-context";
import { MovieActions } from "./movie-actions";
import { MovieI18n } from "./movie-i18n";

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const movie = await prisma.movie.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      releaseYear: true,
      runtimeMinutes: true,
      genrePrimary: true,
      genreSecondary: true,
      posterUrl: true,
      backdropUrl: true,
      overview: true,
      directors: true,
      cast: true,
      reviewScore: true,
      reviewSummary: true,
      moodCalm: true,
      moodDark: true,
      moodEmotional: true,
      toneStylish: true,
      tension: true,
      complexity: true,
      moodTags: true,
      localizedData: true,
    },
  });

  if (!movie) notFound();

  const similar = movie.moodTags.length > 0
    ? await prisma.movie.findMany({
        where: { id: { not: movie.id }, moodTags: { hasSome: movie.moodTags.slice(0, 2) } },
        orderBy: { reviewScore: "desc" },
        take: 3,
        select: { id: true, title: true, releaseYear: true },
      })
    : [];

  const moodProfile = [
    { label: "Calm",       value: movie.moodCalm },
    { label: "Dark",       value: movie.moodDark },
    { label: "Emotional",  value: movie.moodEmotional },
    { label: "Stylish",    value: movie.toneStylish },
    { label: "Tension",    value: movie.tension },
    { label: "Complexity", value: movie.complexity },
  ];

  const localizedData = (movie.localizedData ?? null) as LocalizedData | null;

  return (
    <main className="film-grain min-h-screen bg-[var(--color-bg-void)]">
      {/* Backdrop */}
      {movie.backdropUrl && (
        <div className="relative h-64 w-full overflow-hidden sm:h-80">
          <Image src={movie.backdropUrl} alt="" fill className="object-cover brightness-40" priority />
          <div className="backdrop-fade absolute inset-0" />
        </div>
      )}

      <div className="mx-auto max-w-2xl px-6 py-16">
        {/* Poster */}
        {movie.posterUrl && (
          <div className="mb-8 flex justify-center">
            <div className="relative h-48 w-32 overflow-hidden rounded-[var(--radius-md)] shadow-lg">
              <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover" />
            </div>
          </div>
        )}

        {/* i18n-aware main content (title, directors, cast, overview, review, mood, similar) */}
        <MovieI18n
          movieId={movie.id}
          fallbackTitle={movie.title}
          fallbackOverview={movie.overview}
          fallbackDirectors={movie.directors}
          fallbackCast={movie.cast}
          localizedData={localizedData}
          releaseYear={movie.releaseYear}
          runtimeMinutes={movie.runtimeMinutes}
          genrePrimary={movie.genrePrimary}
          genreSecondary={movie.genreSecondary}
          reviewScore={movie.reviewScore}
          reviewSummary={movie.reviewSummary}
          moodProfile={moodProfile}
          similar={similar}
        />

        {/* Actions (not language-dependent) */}
        <MovieActions movieId={movie.id} title={movie.title} posterUrl={movie.posterUrl} />

        {/* Nav */}
        <div className="credits-divider mb-8 mt-10" />
        <nav className="flex justify-center gap-6">
          <Link href="/browse" className="credits-label transition hover:text-[var(--color-text-primary)]">
            ← Browse
          </Link>
          <Link href="/recommend" className="credits-label transition hover:text-[var(--color-text-primary)]">
            Recommend →
          </Link>
        </nav>
      </div>
    </main>
  );
}
