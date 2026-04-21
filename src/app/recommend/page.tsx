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

  return (
    <main className="mx-auto min-h-screen w-full max-w-xl px-6 py-10">
      <ScreenHeader
        title="今夜の推薦条件"
        description="気分・尺・同伴者を選ぶだけで、最大3本を返します。"
      />
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
