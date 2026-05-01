import { Link } from "@/i18n/navigation";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { auth } from "@/auth";
import { PopButton } from "@/components/ui/pop-button";
import { PopCard } from "@/components/ui/pop-card";
import { movieCardSelect } from "@/lib/db/selects/movie";
import { prisma } from "@/lib/db/prisma";
import { mapCreditsToPersonChipData } from "@/lib/movies/credits";
import { createMovieCardPayload } from "@/lib/movies/movie-card";
import { SwipeResultClient } from "./swipe-result-client";

export default async function RecommendResultPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const t = await getTranslations("recommend.emptyState");
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
            select: movieCardSelect,
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
            {t("message")}
          </p>
          <Link href="/recommend" className="mt-4 inline-block">
            <PopButton variant="secondary">{t("adjust")}</PopButton>
          </Link>
        </PopCard>
      </main>
    );
  }

  const movies = recommendationSession.results.map((r) =>
    createMovieCardPayload({
      id: r.movie.id,
      title: r.movie.title,
      releaseYear: r.movie.releaseYear,
      genrePrimary: r.movie.genrePrimary,
      runtimeMinutes: r.movie.runtimeMinutes,
      directors: r.movie.directors,
      reviewScore: r.movie.reviewScore,
      posterUrl: r.movie.posterUrl,
      overview: r.movie.overview,
      cast: r.movie.cast,
      localizedTitles: r.movie.localizedTitles,
      localizedData: r.movie.localizedData,
      credits: mapCreditsToPersonChipData({
        credits: r.movie.credits,
        directors: r.movie.directors,
        cast: r.movie.cast,
      }),
    }),
  );

  return <SwipeResultClient movies={movies} />;
}
