import { redirect } from "next/navigation";

import { auth } from "@/auth";

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-xl px-6 py-10">
      <h1 className="text-2xl font-semibold">履歴 (Deferred)</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
        MVPでは後続実装対象です。現時点では推薦セッション保存のみ実装済みです。
      </p>
    </main>
  );
}
