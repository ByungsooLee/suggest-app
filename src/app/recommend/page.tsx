import { redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "@/auth";
import { AvatarTrigger } from "@/components/account/avatar-trigger";
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
    select: { onboardingCompletedAt: true, name: true, image: true },
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
    },
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10">
      <AvatarTrigger image={user?.image} name={user?.name} />
      <ScreenHeader
        title="今夜の推薦条件"
        description="4ステップで条件を決めると、今夜向けの3本を返します。"
      />
      <PopCard tone="muted" className="mt-4 space-y-2">
        <p className="text-label">マイページ設定</p>
        <p className="text-body">
          好みジャンル: {mypagePreferences?.favoriteGenres?.length ? mypagePreferences.favoriteGenres.join(" / ") : "未設定"}
        </p>
        <p className="text-body">
          除外ジャンル: {mypagePreferences?.excludedGenres?.length ? mypagePreferences.excludedGenres.join(" / ") : "なし"}
        </p>
        <p className="text-body">
          お気に入り反映: マイページでいつでも変更できます
        </p>
        <Link href="/mypage" className="inline-block">
          <PopButton variant="secondary">マイページで詳細を編集</PopButton>
        </Link>
      </PopCard>
      {!profile ? (
        <PopCard tone="muted" className="mt-6">
          <p className="text-body">Taste profileがまだありません。オンボーディングを完了してから再度お試しください。</p>
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
