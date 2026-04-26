"use client";

import { PopCard } from "@/components/ui/pop-card";

import { type PersonalStats } from "./types";

type PersonalStatsSectionProps = {
  stats: PersonalStats | null;
};

export function PersonalStatsSection({ stats }: PersonalStatsSectionProps) {
  if (!stats) {
    return (
      <PopCard tone="muted">
        <p className="text-sm text-[var(--color-text-secondary)]">統計データを準備中です。</p>
      </PopCard>
    );
  }

  return (
    <PopCard tone="surface" className="space-y-4">
      <div>
        <h2 className="text-movie-title text-[1.35rem]">Personal Stats</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">視聴傾向をコンパクトに可視化します。</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-sm">Watched: {stats.totals.watchedCount}</div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-sm">Watchlist: {stats.totals.watchlistCount}</div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-sm">This month: {stats.totals.watchedThisMonth}</div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-sm">Movies: {stats.totals.moviesCount}</div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-sm">Dramas: {stats.totals.dramasCount}</div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-sm">
          Avg rating: {stats.totals.averageRating ? stats.totals.averageRating.toFixed(1) : "-"}
        </div>
      </div>
      <div className="space-y-2 text-xs text-[var(--color-text-secondary)]">
        <p>Top genres: {stats.topGenres.map((item) => `${item.name}(${item.count})`).join(" / ") || "-"}</p>
        <p>Top directors: {stats.topDirectors.map((item) => `${item.name}(${item.count})`).join(" / ") || "-"}</p>
        <p>Top actors: {stats.topActors.map((item) => `${item.name}(${item.count})`).join(" / ") || "-"}</p>
      </div>
    </PopCard>
  );
}
