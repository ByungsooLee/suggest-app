import Link from "next/link";

import { PopButton } from "@/components/ui/pop-button";
import { PopCard } from "@/components/ui/pop-card";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
      <PopCard tone="muted" className="space-y-4">
        <h1 className="text-2xl font-[500]">ページが見つかりません</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          セッションが存在しないか、アクセス権がありません。
        </p>
        <Link href="/">
          <PopButton variant="primary">ホームへ戻る</PopButton>
        </Link>
      </PopCard>
    </main>
  );
}
