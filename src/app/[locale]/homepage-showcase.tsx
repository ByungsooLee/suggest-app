"use client";

import { Link } from "@/i18n/navigation";
import { Fragment, useEffect, useState } from "react";

type MovieSnippet = {
  id: string; title: string; posterUrl: string | null;
  reviewScore: number | null; genrePrimary: string; releaseYear: number; moodTags?: string[];
};
type TrendingMovie = MovieSnippet & { directors: string[]; watchContexts: string[]; runtimeMinutes: number; overview: string | null; };
type ShowcaseData = {
  trending: TrendingMovie[];
  contextPicks: { solo: MovieSnippet[]; date: MovieSnippet[]; friends: MovieSnippet[] };
  moodPicks: { dark: MovieSnippet[]; uplifting: MovieSnippet[] };
  mbtiShowcase: Record<string, MovieSnippet[]>;
  userRecentMoods: Array<{ mood: string; movies: MovieSnippet[] }>;
  stats: { totalMovies: number; totalUsers: number };
};

function PosterCard({ movie, size = "md" }: { movie: MovieSnippet; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "w-44 h-64" : size === "sm" ? "w-24 h-36" : "w-32 h-48";
  return (
    <Link href={`/movies/${movie.id}`} className="group shrink-0">
      <div className={`${sizeClass} relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] transition-all duration-300 group-hover:scale-[1.04] group-hover:border-[var(--color-border-accent)]`}>
        {movie.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={movie.posterUrl} alt={movie.title} className="h-full w-full object-cover transition-all duration-500 group-hover:brightness-110" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-2">
            <span className="text-center text-[0.65rem] leading-tight text-[var(--color-text-muted)]">{movie.title}</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute bottom-2 left-2 right-2 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <p className="line-clamp-2 text-[0.65rem] font-[500] leading-tight text-white">{movie.title}</p>
          {movie.reviewScore != null && <p className="mt-0.5 text-[0.6rem] text-[var(--color-accent)]">★ {movie.reviewScore.toFixed(1)}</p>}
        </div>
      </div>
    </Link>
  );
}

function ScrollRow({ movies, size = "md" }: { movies: MovieSnippet[]; size?: "sm" | "md" | "lg" }) {
  return (
    <div className="-mx-6 flex gap-3 overflow-x-auto px-6 pb-2" style={{ scrollbarWidth: "none" }}>
      {movies.map((movie) => <PosterCard key={movie.id} movie={movie} size={size} />)}
    </div>
  );
}

function MarqueeRow({ movies, reverse = false }: { movies: TrendingMovie[]; reverse?: boolean }) {
  const doubled = [...movies, ...movies];
  return (
    <div className="relative overflow-hidden">
      <style>{`
        @keyframes marquee-fwd { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes marquee-rev { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .marquee-fwd { animation: marquee-fwd 28s linear infinite; }
        .marquee-rev { animation: marquee-rev 28s linear infinite; }
        .marquee-fwd:hover, .marquee-rev:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .marquee-fwd, .marquee-rev { animation: none; } }
      `}</style>
      <div className={`flex gap-3 ${reverse ? "marquee-rev" : "marquee-fwd"}`} style={{ width: "max-content" }}>
        {doubled.map((movie, i) => <PosterCard key={`${movie.id}-${i}`} movie={movie} size="lg" />)}
      </div>
    </div>
  );
}

function SectionHeader({ label, title, accent }: { label: string; title: string; accent?: string }) {
  return (
    <div className="mb-5">
      <p className="credits-label mb-1.5">{label}</p>
      <h2 className="credits-name-lg">{title}{accent && <span className="ml-2 text-[var(--color-accent)]">{accent}</span>}</h2>
    </div>
  );
}

function ContextSection({ contextPicks }: { contextPicks: ShowcaseData["contextPicks"] }) {
  const [active, setActive] = useState<"solo" | "date" | "friends">("solo");
  const tabs = [
    { id: "solo" as const, label: "🧍 ひとりで" },
    { id: "date" as const, label: "👫 カップルで" },
    { id: "friends" as const, label: "👥 友人と" },
  ];
  return (
    <div>
      <SectionHeader label="WHO YOU'RE WATCHING WITH" title="誰と観る？" />
      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActive(tab.id)}
            className={`rounded-[var(--radius-full)] border px-4 py-2 text-xs font-[500] transition-all duration-200 ${active === tab.id ? "border-[var(--color-border-accent)] bg-[var(--color-accent-dim)] text-[var(--color-accent)]" : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[rgba(240,237,232,0.2)]"}`}>
            {tab.label}
          </button>
        ))}
      </div>
      <ScrollRow movies={contextPicks[active]} size="md" />
    </div>
  );
}

const MBTI_DESCRIPTIONS: Record<string, { label: string; desc: string; emoji: string }> = {
  IN:   { label: "IN型 (INTJ/INFJ/INTP/INFP)", desc: "静かに深く没入できる作品", emoji: "🌙" },
  EN:   { label: "EN型 (ENTJ/ENFJ/ENTP/ENFP)", desc: "エネルギッシュで爽快な作品", emoji: "⚡" },
  xNTx: { label: "NT型 (INTJ/INTP/ENTJ/ENTP)", desc: "複雑で知的刺激のある作品", emoji: "🧠" },
  xNFx: { label: "NF型 (INFJ/INFP/ENFJ/ENFP)", desc: "感情的で余韻の深い作品", emoji: "💫" },
};

function MbtiSection({ mbtiShowcase }: { mbtiShowcase: ShowcaseData["mbtiShowcase"] }) {
  const [active, setActive] = useState("IN");
  return (
    <div>
      <SectionHeader label="MBTI × MOVIES" title="MBTIタイプ別" accent="おすすめ" />
      <div className="mb-5 flex flex-wrap gap-2">
        {Object.keys(mbtiShowcase).map((key) => {
          const info = MBTI_DESCRIPTIONS[key];
          return (
            <button key={key} onClick={() => setActive(key)}
              className={`rounded-[var(--radius-lg)] border px-4 py-2.5 text-left transition-all duration-200 ${active === key ? "border-[var(--color-border-accent)] bg-[var(--color-accent-dim)]" : "border-[var(--color-border)] hover:border-[rgba(240,237,232,0.2)]"}`}>
              <span className="mr-1.5">{info?.emoji}</span>
              <span className={`text-xs font-[500] ${active === key ? "text-[var(--color-accent)]" : "text-[var(--color-text-secondary)]"}`}>{key}</span>
            </button>
          );
        })}
      </div>
      {MBTI_DESCRIPTIONS[active] && <p className="mb-4 text-sm text-[var(--color-text-secondary)]">{MBTI_DESCRIPTIONS[active].desc}</p>}
      <ScrollRow movies={mbtiShowcase[active] ?? []} size="md" />
    </div>
  );
}

function MoodSection({ moodPicks }: { moodPicks: ShowcaseData["moodPicks"] }) {
  const [active, setActive] = useState<"dark" | "uplifting">("uplifting");
  return (
    <div>
      <SectionHeader label="TONIGHT'S VIBE" title="今夜の気分は？" />
      <div className="mb-5 flex gap-3">
        {[{ id: "uplifting" as const, label: "⚡ 前向き・笑える" }, { id: "dark" as const, label: "🌑 ダーク・緊張感" }].map((btn) => (
          <button key={btn.id} onClick={() => setActive(btn.id)}
            className={`rounded-[var(--radius-full)] border px-4 py-2 text-xs font-[500] transition-all ${active === btn.id ? "border-[var(--color-border-accent)] bg-[var(--color-accent-dim)] text-[var(--color-accent)]" : "border-[var(--color-border)] text-[var(--color-text-secondary)]"}`}>
            {btn.label}
          </button>
        ))}
      </div>
      <ScrollRow movies={moodPicks[active]} size="md" />
    </div>
  );
}

function UserHistorySection({ userRecentMoods }: { userRecentMoods: ShowcaseData["userRecentMoods"] }) {
  if (userRecentMoods.length === 0) return null;
  return (
    <div>
      <SectionHeader label="YOUR HISTORY" title="あなたの過去の" accent="おすすめ" />
      <div className="space-y-6">
        {userRecentMoods.map((entry, i) => (
          <div key={i}>
            <p className="credits-label mb-3">{entry.mood.split("+").map((m) => `#${m}`).join(" ")}</p>
            <ScrollRow movies={entry.movies} size="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomepageShowcase({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [data, setData] = useState<ShowcaseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/home/showcase", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { setData(d as ShowcaseData); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 py-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="skeleton h-4 w-40 rounded-full" />
            <div className="flex gap-3 overflow-hidden">
              {[...Array(6)].map((_, j) => <div key={j} className="skeleton h-48 w-32 shrink-0 rounded-[var(--radius-lg)]" />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-14 pb-16">
      {/* Stats */}
      <div className="flex gap-8 py-2">
        {[
          { value: data.stats.totalMovies, label: "映画カタログ" },
          { value: data.stats.totalUsers, label: "ユーザー" },
          { value: 3, label: "最大推薦数" },
        ].map((item, i) => (
          <Fragment key={item.label}>
            {i > 0 && <div className="h-auto w-px bg-[var(--color-border)]" />}
            <div>
              <p className="text-2xl font-[400]" style={{ fontFamily: "var(--font-dm-serif)" }}>{item.value}</p>
              <p className="credits-label">{item.label}</p>
            </div>
          </Fragment>
        ))}
      </div>

      {/* Trending marquee */}
      <div>
        <SectionHeader label="HIGH RATED" title="注目作品" accent="TOP PICKS" />
        <div className="space-y-3 overflow-hidden -mx-6">
          <MarqueeRow movies={data.trending.slice(0, 8)} />
          <MarqueeRow movies={data.trending.slice(4, 12)} reverse />
        </div>
      </div>

      {isLoggedIn && <UserHistorySection userRecentMoods={data.userRecentMoods} />}
      <ContextSection contextPicks={data.contextPicks} />
      <MoodSection moodPicks={data.moodPicks} />
      <MbtiSection mbtiShowcase={data.mbtiShowcase} />

      {/* CTA */}
      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border-accent)] bg-[var(--color-accent-dim)] p-6">
        <p className="credits-label mb-2">READY?</p>
        <h3 className="credits-name-lg mb-4">今夜の1本を決める</h3>
        <p className="text-body mb-5">4ステップで条件を入力するだけ。あなたの気分と好みに合った映画を最大3本提案します。</p>
        <Link href={isLoggedIn ? "/recommend" : "/login"}
          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-accent)] px-6 py-3 text-sm font-[500] text-[#080808] transition-all hover:brightness-105">
          {isLoggedIn ? "推薦を始める →" : "無料ではじめる →"}
        </Link>
      </div>
    </div>
  );
}
