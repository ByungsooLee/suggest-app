import { redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { ScreenHeader } from "@/components/screen-header";
import { PopCard } from "@/components/ui/pop-card";
import { PopButton } from "@/components/ui/pop-button";

import { RecommendForm } from "./recommend-form";

export default async function RecommendPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompletedAt: true },
  });
  if (!user?.onboardingCompletedAt) {
    redirect("/onboarding");
  }

  const profile = await prisma.userTasteProfile.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  const mypagePreferences = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      favoriteGenres: true,
      excludedGenres: true,
      preferredDirectors: true,
      preferredActors: true,
      discoveryMode: true,
    },
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-xl px-6 py-10">
      <ScreenHeader
        title="今夜の推薦条件"
        description="気分・尺・同伴者を選ぶだけで、最大3本を返します。"
      />
      <Link href="/mypage" className="mt-3 inline-block">
        <PopButton variant="ghost">マイページでジャンルを調整</PopButton>
      </Link>
      <PopCard tone="surface" className="mt-4 space-y-2 text-sm">
        <p className="font-semibold text-zinc-700 dark:text-zinc-200">現在のジャンル設定</p>
        <p className="text-zinc-600 dark:text-zinc-300">
          好き:{" "}
          {mypagePreferences?.favoriteGenres?.length
            ? mypagePreferences.favoriteGenres.join(", ")
            : "未設定"}
        </p>
        <p className="text-zinc-600 dark:text-zinc-300">
          除外:{" "}
          {mypagePreferences?.excludedGenres?.length
            ? mypagePreferences.excludedGenres.join(", ")
            : "なし"}
        </p>
        <p className="text-zinc-600 dark:text-zinc-300">
          提案モード: {mypagePreferences?.discoveryMode ?? "balanced"}
        </p>
        <p className="text-zinc-600 dark:text-zinc-300">
          推し監督: {mypagePreferences?.preferredDirectors?.length ? mypagePreferences.preferredDirectors.join(", ") : "未設定"}
        </p>
        <p className="text-zinc-600 dark:text-zinc-300">
          推し俳優: {mypagePreferences?.preferredActors?.length ? mypagePreferences.preferredActors.join(", ") : "未設定"}
        </p>
      </PopCard>
      {!profile ? (
        <PopCard tone="muted" className="mt-6 text-sm text-zinc-600 dark:text-zinc-300">
          <p>Taste profileがまだありません。オンボーディングを完了してから再度お試しください。</p>
          <Link href="/onboarding" className="mt-3 inline-block">
            <PopButton variant="secondary">オンボーディングへ戻る</PopButton>
          </Link>
        </PopCard>
      ) : (
        <RecommendForm />
      )}
    </main>
  );
}
