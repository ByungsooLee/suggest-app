import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AvatarTrigger } from "@/components/account/avatar-trigger";
import { ScreenHeader } from "@/components/screen-header";
import { PopButton } from "@/components/ui/pop-button";
import { PopCard } from "@/components/ui/pop-card";
import { MyPageHub } from "./mypage-hub";

export default async function MyPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10">
      <AvatarTrigger image={session.user.image} name={session.user.name} />
      <ScreenHeader
        title="マイページ"
        description="プロフィール、視聴履歴、推薦プリファレンスをまとめて管理できます。"
      />
      <Link href="/" className="mt-3 inline-block">
        <PopButton variant="ghost">トップページに戻る</PopButton>
      </Link>
      <PopCard tone="muted" className="mt-5 text-sm text-[var(--color-text-secondary)]">
        視聴履歴が少ない場合は、まずオンボーディングや推薦結果から作品を追加すると精度が上がります。
      </PopCard>
      <div className="mt-5">
        <MyPageHub />
      </div>
    </main>
  );
}
