import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { FeedbackChips } from "@/components/feedback-chips";
import { MovieCard } from "@/components/movie-card";
import { ScreenHeader } from "@/components/screen-header";
import { PopButton } from "@/components/ui/pop-button";
import { PopCard } from "@/components/ui/pop-card";
import { prisma } from "@/lib/db/prisma";

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
      <main className="mx-auto min-h-screen w-full max-w-2xl px-6 py-10">
        <ScreenHeader title="候補が見つかりませんでした" description="条件を少し緩めると結果が出やすくなります。" />
        <PopCard tone="muted" className="mt-6 text-sm">
          <p className="text-zinc-600 dark:text-zinc-300">
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
    <main className="mx-auto min-h-screen w-full max-w-2xl space-y-5 px-6 py-10">
      <ScreenHeader title="今夜のおすすめ" description="主推薦1本を中心に、最大2本のバックアップを提案します。" />
      <MovieCard
        rank={topPick.rank}
        title={topPick.movie.title}
        score={topPick.totalScore}
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
          score={item.totalScore}
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
      <div className="flex flex-wrap gap-2">
        <PopButton variant="primary">この作品を観る</PopButton>
        <Link href="/recommend">
          <PopButton variant="ghost">別条件で再提案</PopButton>
        </Link>
      </div>
      <FeedbackChips sessionId={recommendationSession.id} recommendationResultId={topPick.id} />
    </main>
  );
}
