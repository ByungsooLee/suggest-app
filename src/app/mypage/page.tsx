import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ScreenHeader } from "@/components/screen-header";
import { PopButton } from "@/components/ui/pop-button";
import { PopCard } from "@/components/ui/pop-card";

import { GenrePreferencesForm } from "./genre-preferences-form";

export default async function MyPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-6 py-10">
      <ScreenHeader
        title="マイページ"
        description="好きな作品傾向をいつでも更新して、提案の幅を自分に合わせて調整できます。"
      />
      <Link href="/" className="mt-3 inline-block">
        <PopButton variant="ghost">トップページに戻る</PopButton>
      </Link>
      <PopCard tone="muted" className="mt-5 text-sm text-zinc-600 dark:text-zinc-300">
        ここで設定したジャンルは、次回の映画推薦から自動で反映されます。
      </PopCard>
      <div className="mt-5">
        <GenrePreferencesForm />
      </div>
    </main>
  );
}
