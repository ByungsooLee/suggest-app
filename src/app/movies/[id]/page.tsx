import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { MovieActions } from "./movie-actions";

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
    },
  });

  if (!movie) notFound();

  const similar = movie.moodTags.length > 0
    ? await prisma.movie.findMany({
        where: {
          id: { not: movie.id },
          moodTags: { hasSome: movie.moodTags.slice(0, 2) },
        },
        orderBy: { reviewScore: "desc" },
        take: 3,
        select: { id: true, title: true, releaseYear: true, directors: true },
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

  return (
    <main className="film-grain min-h-screen bg-[var(--color-bg-void)]">
      {/* Backdrop */}
      {movie.backdropUrl && (
        <div className="relative h-64 w-full overflow-hidden sm:h-80">
          <Image
            src={movie.backdropUrl}
            alt=""
            fill
            className="object-cover brightness-40"
            priority
          />
          <div className="backdrop-fade absolute inset-0" />
        </div>
      )}

      <div className="mx-auto max-w-2xl px-6 py-16">
        {/* Poster + Title */}
        <div className="flex gap-6">
          {movie.posterUrl && (
            <div className="relative h-36 w-24 shrink-0 overflow-hidden rounded-[var(--radius-md)]">
              <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover" />
            </div>
          )}
          <div>
            <p className="credits-label mb-2">
              {movie.releaseYear} · {movie.runtimeMinutes}min · {movie.genrePrimary}
            </p>
            <h1 className="credits-name-lg">{movie.title}</h1>
            <MovieActions movieId={movie.id} title={movie.title} posterUrl={movie.posterUrl} />
          </div>
        </div>

        <div className="credits-divider my-10" />

        {/* Directors */}
        {movie.directors.length > 0 && (
          <section className="credits-section mb-10">
            <p className="credits-label mb-3">Direction</p>
            {movie.directors.map((d) => (
              <Link key={d} href={`/people/${encodeURIComponent(d)}?role=director`}>
                <p className="credits-name transition hover:text-[var(--color-accent)]">{d}</p>
              </Link>
            ))}
          </section>
        )}

        {/* Cast */}
        {movie.cast.length > 0 && (
          <section className="credits-section mb-10">
            <p className="credits-label mb-3">Cast</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1 justify-center">
              {movie.cast.slice(0, 8).map((name) => (
                <Link key={name} href={`/people/${encodeURIComponent(name)}?role=actor`}>
                  <p className="credits-name text-sm transition hover:text-[var(--color-accent)]">{name}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Overview */}
        {movie.overview && (
          <>
            <div className="credits-divider mb-10" />
            <section className="credits-section mb-10">
              <p className="credits-label mb-4">Synopsis</p>
              <p className="text-body mx-auto max-w-sm leading-relaxed">{movie.overview}</p>
            </section>
          </>
        )}

        {/* Review */}
        {movie.reviewScore != null && (
          <>
            <div className="credits-divider mb-10" />
            <section className="credits-section mb-10">
              <p className="credits-label mb-2">Review</p>
              <p className="credits-name-lg text-[var(--color-accent)]">
                {movie.reviewScore.toFixed(1)}
                <span className="credits-label ml-1">/10</span>
              </p>
              {movie.reviewSummary && (
                <p className="text-body mx-auto mt-3 max-w-sm">{movie.reviewSummary}</p>
              )}
            </section>
          </>
        )}

        {/* Mood Profile (Task 3-A) */}
        <div className="credits-divider mb-10" />
        <section className="credits-section mb-10">
          <p className="credits-label mb-6">Mood Profile</p>
          <div className="mx-auto max-w-xs space-y-3">
            {moodProfile.map(({ label, value }) => (
              <div key={label} className="credits-score-bar">
                <span className="credits-label w-20 shrink-0 text-right">{label}</span>
                <div className="relative h-px flex-1 bg-[var(--color-border)]">
                  <div
                    className="credits-score-fill absolute inset-y-0 left-0"
                    style={{ width: `${Math.round(value * 100)}%` }}
                  />
                </div>
                <span className="credits-label w-8 shrink-0 text-left">
                  {Math.round(value * 10)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Similar Films (Task 3-C) */}
        {similar.length > 0 && (
          <>
            <div className="credits-divider mb-10" />
            <section className="credits-section mb-10">
              <p className="credits-label mb-6">Similar Films</p>
              <div className="space-y-4">
                {similar.map((s) => (
                  <Link
                    key={s.id}
                    href={`/movies/${s.id}`}
                    className="credits-name block text-base transition hover:text-[var(--color-accent)]"
                  >
                    {s.title}
                    <span className="ml-2 text-xs text-[var(--color-text-muted)]">
                      {s.releaseYear}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Nav */}
        <div className="credits-divider mb-8" />
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
