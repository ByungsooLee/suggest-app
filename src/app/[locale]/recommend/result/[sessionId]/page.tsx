import { Link } from "@/i18n/navigation";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { PopButton } from "@/components/ui/pop-button";
import { PopCard } from "@/components/ui/pop-card";
import { prisma } from "@/lib/db/prisma";
import { SwipeResultClient } from "./swipe-result-client";

export default async function RecommendResultPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { sessionId } = await params;

  const recommendationSession = await prisma.recommendationSession.findFirst({
    where: { id: sessionId, userId: session.user.id },
    include: {
      results: {
        include: {
          movie: {
            include: {
              credits: {
                select: {
                  role: true,
                  creditOrder: true,
                  person: {
                    select: {
                      id: true,
                      name: true,
                      tmdbId: true,
                    },
                  },
                },
                orderBy: [{ role: "asc" }, { creditOrder: "asc" }],
              },
            },
          },
        },
        orderBy: { rank: "asc" },
      },
    },
  });

  if (!recommendationSession) {
    notFound();
  }

  if (recommendationSession.status === "empty" || recommendationSession.results.length === 0) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10">
        <PopCard tone="muted" className="mt-6 text-sm">
          <p className="text-[var(--color-text-secondary)]">
            候補が見つかりませんでした。除外条件を1つ外すか、視聴時間の幅を広げてお試しください。
          </p>
          <Link href="/recommend" className="mt-4 inline-block">
            <PopButton variant="secondary">条件を調整する</PopButton>
          </Link>
        </PopCard>
      </main>
    );
  }

  const movies = recommendationSession.results.map((r) => ({
    id: r.movie.id,
    title: r.movie.title,
    year: r.movie.releaseYear,
    genre: r.movie.genrePrimary,
    duration: r.movie.runtimeMinutes,
    directors: r.movie.directors,
    score: r.movie.reviewScore,
    posterUrl: r.movie.posterUrl,
    overview: r.movie.overview,
    localizedTitles: r.movie.localizedTitles,
    localizedData: r.movie.localizedData,
    credits:
      r.movie.credits.length > 0
        ? r.movie.credits.map((credit) => ({
            personId: credit.person.id,
            tmdbId: credit.person.tmdbId,
            name: credit.person.name,
            role: credit.role,
          }))
        : [
            ...r.movie.directors.map((name) => ({ name, role: "director" as const })),
            ...r.movie.cast.map((name) => ({ name, role: "actor" as const })),
          ],
  }));

  return <SwipeResultClient movies={movies} />;
}
