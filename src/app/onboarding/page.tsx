import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ScreenHeader } from "@/components/screen-header";
import { PopCard } from "@/components/ui/pop-card";
import { prisma } from "@/lib/db/prisma";

import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompletedAt: true },
  });
  if (user?.onboardingCompletedAt) {
    redirect("/recommend");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-xl px-6 py-10">
      <ScreenHeader
        title="初期オンボーディング"
        description="3秒で理解できる選択式フローです。MBTI選択とスワイプだけで好み推定を開始します。"
      />
      <PopCard tone="muted" className="mt-5 text-sm text-zinc-600 dark:text-zinc-300">
        テキスト入力は不要です。タイプ選択 → 直感スワイプ → ワンタップ完了で進められます。
      </PopCard>
      <OnboardingForm />
    </main>
  );
}
