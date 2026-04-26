import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { AvatarTrigger } from "@/components/account/avatar-trigger";
import { CinemaBg } from "@/components/cinema-bg";
import { PopButton } from "@/components/ui/pop-button";
import { PopCard } from "@/components/ui/pop-card";

export default async function Home() {
  const session = await auth();

  const bgTitles = session?.user?.id
    ? await prisma.movie
        .findMany({
          select: { title: true },
          orderBy: { reviewScore: "desc" },
          take: 30,
        })
        .then((r) => r.map((m) => m.title))
    : [];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16">
      {bgTitles.length > 0 && <CinemaBg titles={bgTitles} />}
      <AvatarTrigger image={session?.user?.image} name={session?.user?.name} />
      <PopCard tone="highlight" className="space-y-5">
        <p className="text-heading">movie tonight</p>
        <h1 className="text-movie-title text-4xl leading-tight">
          迷う夜を、
          <br />
          ポップに決める。
        </h1>
        <p className="text-body text-base">
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
      <div className="mt-4 grid gap-3 text-sm text-[var(--color-text-secondary)] md:grid-cols-3">
        <PopCard tone="surface">1画面で入力完了</PopCard>
        <PopCard tone="surface">最大3本だけ提案</PopCard>
        <PopCard tone="surface">理由は短く明確</PopCard>
      </div>
      <nav className="mt-6 flex justify-center gap-6">
        <Link href="/browse" className="credits-label transition hover:text-[var(--color-text-primary)]">
          Browse
        </Link>
        <Link href="/discover" className="credits-label transition hover:text-[var(--color-text-primary)]">
          Discover
        </Link>
      </nav>
    </main>
  );
}
