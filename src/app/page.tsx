import Link from "next/link";
import { PopButton } from "@/components/ui/pop-button";
import { PopCard } from "@/components/ui/pop-card";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16">
      <PopCard tone="highlight" className="space-y-5">
        <p className="text-sm font-semibold uppercase tracking-widest text-pink-700 dark:text-pink-200">
          movie tonight
        </p>
        <h1 className="text-4xl font-extrabold leading-tight text-zinc-900 dark:text-zinc-50">
          迷う夜を、
          <br />
          ポップに決める。
        </h1>
        <p className="text-base text-zinc-700 dark:text-zinc-200">
          音楽の好みと今の気分から、今夜の映画を最大3本で提案。主推薦1本を大きく見せるから、すぐ決められます。
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/login">
            <PopButton variant="primary">今すぐ決める</PopButton>
          </Link>
          <Link href="/recommend">
            <PopButton variant="ghost">条件から試す</PopButton>
          </Link>
          <Link href="/mypage">
            <PopButton variant="secondary">マイページ</PopButton>
          </Link>
        </div>
      </PopCard>
      <div className="mt-4 grid gap-3 text-sm text-zinc-600 dark:text-zinc-300 md:grid-cols-3">
        <PopCard tone="surface">1画面で入力完了</PopCard>
        <PopCard tone="surface">最大3本だけ提案</PopCard>
        <PopCard tone="surface">理由は短く明確</PopCard>
      </div>
    </main>
  );
}
