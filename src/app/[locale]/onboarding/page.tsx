import { redirect } from "next/navigation";

import { getAppUser, getAppUserId } from "@/lib/auth/app-user";
import { AvatarTrigger } from "@/components/account/avatar-trigger";
import { ScreenHeader } from "@/components/screen-header";
import { PopCard } from "@/components/ui/pop-card";
import { prisma } from "@/lib/db/prisma";

import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const appUser = await getAppUser();
  const userId = await getAppUserId();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboardingCompletedAt: true },
  });
  if (user?.onboardingCompletedAt) {
    redirect("/recommend");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-xl px-4 py-6 md:px-6 md:py-10">
      <AvatarTrigger image={appUser.image} name={appUser.name} />
      <div className="hidden md:block">
        <ScreenHeader
          title="初期オンボーディング"
          description="3秒で理解できる選択式フローです。MBTI選択とスワイプだけで好み推定を開始します。"
        />
      </div>
      <PopCard tone="muted" className="mt-5 hidden text-sm text-[var(--color-text-secondary)] md:block">
        テキスト入力は不要です。タイプ選択 → 直感スワイプ → ワンタップ完了で進められます。
      </PopCard>
      <OnboardingForm />
    </main>
  );
}
