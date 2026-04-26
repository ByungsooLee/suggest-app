import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AvatarTrigger } from "@/components/account/avatar-trigger";
import { ScreenHeader } from "@/components/screen-header";
import { PopButton } from "@/components/ui/pop-button";
import { LibraryPageClient } from "@/components/library/library-page-client";

export default async function WatchedLibraryPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <AvatarTrigger image={session.user.image} name={session.user.name} />
      <ScreenHeader title="視聴ライブラリ" description="ポスターウォールで視聴履歴を管理し、推薦精度を高めます。" />
      <Link href="/mypage" className="inline-block">
        <PopButton variant="ghost">マイページに戻る</PopButton>
      </Link>
      <div className="mt-5">
        <LibraryPageClient />
      </div>
    </main>
  );
}
