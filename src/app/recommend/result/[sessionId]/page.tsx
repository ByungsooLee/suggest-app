import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { AvatarTrigger } from "@/components/account/avatar-trigger";
import { FeedbackChips } from "@/components/feedback-chips";
import { MovieCard } from "@/components/movie-card";
import { SaveWatchlistButton } from "@/components/recommendation/save-watchlist-button";
import { ScreenHeader } from "@/components/screen-header";
import { PopButton } from "@/components/ui/pop-button";
import { PopCard } from "@/components/ui/pop-card";
import { prisma } from "@/lib/db/prisma";
import { MbtiResultBanner } from "./mbti-result-banner";

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
        include: { movie: true },
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
        <AvatarTrigger image={session.user.image} name={session.user.name} />
        <ScreenHeader title="候補が見つかりませんでした" description="条件を少し緩めると結果が出やすくなります。" />
        <PopCard tone="muted" className="mt-6 text-sm">
          <p className="text-[var(--color-text-secondary)]">
            除外条件を1つ外す、または視聴時間の幅を広げて再度お試しください。
          </p>
          <Link
            href="/recommend"
            className="mt-4 inline-block"
          >
            <PopButton variant="secondary">条件を調整する</PopButton>
          </Link>
        </PopCard>
      </main>
    );
  }

  const [topPick, ...backups] = recommendationSession.results;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl space-y-5 px-6 py-10">
      <AvatarTrigger image={session.user.image} name={session.user.name} />
      <ScreenHeader title="今夜のおすすめ" description="主推薦1本を中心に、最大2本のバックアップを提案します。" />
      <MbtiResultBanner />
      <Link href="/" className="inline-block">
        <PopButton variant="ghost">トップページに戻る</PopButton>
      </Link>
      <section className="recommend-grid">
        <MovieCard
          rank={topPick.rank}
          title={topPick.movie.title}
          posterUrl={topPick.movie.posterUrl}
          overview={topPick.movie.overview}
          directors={topPick.movie.directors}
          cast={topPick.movie.cast}
          reviewScore={topPick.movie.reviewScore}
          reviewSummary={topPick.movie.reviewSummary}
          reasons={[topPick.reason1, topPick.reason2, topPick.reason3]
            .filter((v): v is string => Boolean(v))
            .map((text, index) => ({
              text,
              type: (index === 0
                ? "mood_match"
                : index === 1
                  ? "context_match"
                  : "runtime_fit") as "mood_match" | "context_match" | "runtime_fit" | "style_match",
            }))}
          primary
        />
        {backups.slice(0, 2).map((item) => (
          <MovieCard
            key={item.id}
            rank={item.rank}
            title={item.movie.title}
            posterUrl={item.movie.posterUrl}
            overview={item.movie.overview}
            directors={item.movie.directors}
            cast={item.movie.cast}
            reviewScore={item.movie.reviewScore}
            reviewSummary={item.movie.reviewSummary}
            reasons={[item.reason1, item.reason2, item.reason3]
              .filter((v): v is string => Boolean(v))
              .map((text, index) => ({
                text,
                type: (index === 0
                  ? "mood_match"
                  : index === 1
                    ? "context_match"
                    : "runtime_fit") as "mood_match" | "context_match" | "runtime_fit" | "style_match",
              }))}
          />
        ))}
      </section>
      <div className="flex flex-wrap gap-2">
        <PopButton variant="primary">この作品を観る</PopButton>
        <SaveWatchlistButton
          movieId={topPick.movie.id}
          title={topPick.movie.title}
          posterUrl={topPick.movie.posterUrl}
          recommendationResultId={topPick.id}
        />
        <Link href="/recommend">
          <PopButton variant="ghost">別条件で再提案</PopButton>
        </Link>
        <Link href="/">
          <PopButton variant="ghost">トップページに戻る</PopButton>
        </Link>
      </div>
      <FeedbackChips sessionId={recommendationSession.id} recommendationResultId={topPick.id} />
    </main>
  );
}
