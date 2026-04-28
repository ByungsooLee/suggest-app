import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import type { LocalizedData } from "@/lib/i18n/lang-context";
import { MovieDetailClient } from "./movie-detail-client";

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

  const [similar, watchLog] = await Promise.all([
    movie.moodTags.length > 0
      ? prisma.movie.findMany({
          where: { id: { not: movie.id }, moodTags: { hasSome: movie.moodTags.slice(0, 2) } },
          orderBy: { reviewScore: "desc" },
          take: 3,
          select: { id: true, title: true, releaseYear: true },
        })
      : Promise.resolve([]),
    prisma.watchLog.findUnique({
      where: { userId_movieId: { userId: session.user.id, movieId: id } },
      select: { emotion: true, memo: true, score: true, chatSummary: true, watchedAt: true },
    }),
  ]);

  const moodProfile = [
    { label: "Calm",       value: movie.moodCalm },
    { label: "Dark",       value: movie.moodDark },
    { label: "Emotional",  value: movie.moodEmotional },
    { label: "Stylish",    value: movie.toneStylish },
    { label: "Tension",    value: movie.tension },
    { label: "Complexity", value: movie.complexity },
  ];

  const localizedData = (movie.localizedData ?? null) as LocalizedData | null;

  const watchLogData = watchLog
    ? { ...watchLog, watchedAt: watchLog.watchedAt.toISOString() }
    : null;

  return (
    <MovieDetailClient
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
      posterUrl={movie.posterUrl}
      watchLog={watchLogData}
    />
  );
}
