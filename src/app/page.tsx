import Link from "next/link";
import { auth } from "@/auth";
import { AvatarTrigger } from "@/components/account/avatar-trigger";
import { PopButton } from "@/components/ui/pop-button";
import { HomepageShowcase } from "./homepage-showcase";

export default async function Home() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user?.id);

  return (
    <main className="min-h-screen bg-[var(--color-bg-void)]">
      <AvatarTrigger image={session?.user?.image} name={session?.user?.name} />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-20 pb-14">
        <div className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(232,201,122,0.06) 0%, transparent 70%)" }} />
        <div className="relative mx-auto max-w-5xl">
          <p className="credits-label mb-4">MOVIE TONIGHT</p>
          <h1 className="mb-6 leading-tight"
            style={{ fontFamily: "var(--font-dm-serif)", fontSize: "clamp(2.2rem, 6vw, 4rem)", fontWeight: 400, letterSpacing: "-0.025em", color: "var(--color-text-primary)" }}>
            今夜の映画、<br />
            <span className="text-[var(--color-accent)]">3秒で決める。</span>
          </h1>
          <p className="text-body mb-8 max-w-md text-base">
            あなたの気分・一緒に観る相手・好みのジャンルから、今夜ピッタリの映画を最大3本で提案。迷う時間をゼロにします。
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={isLoggedIn ? "/recommend" : "/login"}>
              <PopButton variant="primary">{isLoggedIn ? "今夜の1本を探す →" : "無料ではじめる →"}</PopButton>
            </Link>
            {!isLoggedIn && <Link href="/login"><PopButton variant="secondary">ログイン</PopButton></Link>}
            <Link href="/browse"><PopButton variant="ghost">カタログを見る</PopButton></Link>
          </div>
        </div>
      </section>

      {/* Feature badges */}
      <section className="border-y border-[var(--color-border)] bg-[var(--color-bg-surface)]">
        <div className="mx-auto flex max-w-5xl flex-wrap divide-x divide-[var(--color-border)]">
          {[
            { icon: "🎯", text: "気分ベースで提案" },
            { icon: "⚡", text: "4ステップで完了" },
            { icon: "🎬", text: "最大3本に絞り込み" },
            { icon: "🧠", text: "MBTI×好みを学習" },
          ].map((item) => (
            <div key={item.text} className="flex flex-1 items-center justify-center gap-2 px-4 py-3">
              <span>{item.icon}</span>
              <span className="credits-label whitespace-nowrap">{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Showcase */}
      <section className="mx-auto max-w-5xl px-6 pt-12">
        <HomepageShowcase isLoggedIn={isLoggedIn} />
      </section>

      {/* Footer nav */}
      <footer className="border-t border-[var(--color-border)] px-6 py-6">
        <nav className="mx-auto flex max-w-5xl justify-center gap-8">
          {[{ href: "/browse", label: "Browse" }, { href: "/discover", label: "Discover" }, { href: "/mypage", label: "My Page" }].map((link) => (
            <Link key={link.href} href={link.href} className="credits-label transition hover:text-[var(--color-text-primary)]">{link.label}</Link>
          ))}
        </nav>
      </footer>
    </main>
  );
}
