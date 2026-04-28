import { Link } from "@/i18n/navigation";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AvatarTrigger } from "@/components/account/avatar-trigger";
import { QuickAddPanel } from "@/components/library/quick-add-panel";
import { ScreenHeader } from "@/components/screen-header";
import { PopButton } from "@/components/ui/pop-button";

export default async function QuickAddPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-10">
      <AvatarTrigger image={session.user.image} name={session.user.name} />
      <ScreenHeader title="クイック分類" description="1枚ずつ直感で反応し、視聴/嗜好シグナルを高速収集します。" />
      <div className="flex gap-2">
        <Link href="/mypage/library">
          <PopButton variant="ghost">ライブラリへ戻る</PopButton>
        </Link>
        <Link href="/mypage/library/add">
          <PopButton variant="secondary">検索追加へ</PopButton>
        </Link>
      </div>
      <div className="mt-5">
        <QuickAddPanel />
      </div>
    </main>
  );
}
