import { Link } from "@/i18n/navigation";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AvatarTrigger } from "@/components/account/avatar-trigger";
import { ScreenHeader } from "@/components/screen-header";
import { SearchAddPanel } from "@/components/library/search-add-panel";
import { PopButton } from "@/components/ui/pop-button";

export default async function WatchedLibraryAddPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <AvatarTrigger image={session.user.image} name={session.user.name} />
      <ScreenHeader title="視聴済みを登録" description="タイトル・俳優・監督で探して、最小操作でライブラリ追加します。" />
      <div className="flex gap-2">
        <Link href="/mypage/library">
          <PopButton variant="ghost">ライブラリへ戻る</PopButton>
        </Link>
        <Link href="/mypage/library/quick-add">
          <PopButton variant="secondary">クイック分類へ</PopButton>
        </Link>
      </div>
      <div className="mt-5">
        <SearchAddPanel />
      </div>
    </main>
  );
}
