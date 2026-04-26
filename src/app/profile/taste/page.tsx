import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AvatarTrigger } from "@/components/account/avatar-trigger";
import { ScreenHeader } from "@/components/screen-header";
import { prisma } from "@/lib/db/prisma";
import { RankingsGate } from "./rankings-gate";

export default async function TasteProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await prisma.userTasteProfile.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-xl px-6 py-10">
      <AvatarTrigger image={session.user.image} name={session.user.name} />
      <ScreenHeader
        title="あなたのTaste Profile"
        description="推薦で使う特徴量をシンプルに表示します。必要なら再構築できます。"
      />

      {!profile && (
        <section className="mt-6 space-y-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
          <p className="text-sm text-[var(--color-text-secondary)]">
            まだプロファイルがありません。オンボーディングを完了するか、再構築してください。
          </p>
          <div className="flex gap-2">
            <Link
              href="/onboarding"
              className="rounded-[var(--radius-md)] bg-[var(--color-accent)] px-4 py-2 text-sm font-[500] text-[#080808]"
            >
              オンボーディングへ
            </Link>
            <form action="/api/taste-profile/rebuild" method="post">
              <button
                type="submit"
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-primary)]"
              >
                再構築を試す
              </button>
            </form>
          </div>
        </section>
      )}

      {profile && (
        <section className="mt-6 space-y-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
          <p className="text-sm text-[var(--color-text-secondary)]">{profile.summary}</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <p>calm: {(profile.moodCalm * 100).toFixed(0)}%</p>
            <p>dark: {(profile.moodDark * 100).toFixed(0)}%</p>
            <p>emotional: {(profile.moodEmotional * 100).toFixed(0)}%</p>
            <p>stylish: {(profile.toneStylish * 100).toFixed(0)}%</p>
            <p>funny: {(profile.toneFunny * 100).toFixed(0)}%</p>
            <p>complexity: {(profile.complexity * 100).toFixed(0)}%</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/onboarding"
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2 text-sm"
            >
              入力を編集
            </Link>
            <Link
              href="/recommend"
              className="rounded-[var(--radius-md)] bg-[var(--color-accent)] px-4 py-2 text-sm font-[500] text-[#080808]"
            >
              今夜の推薦を作る
            </Link>
          </div>
        </section>
      )}

      <RankingsGate />
    </main>
  );
}
