"use client";

import { useTranslations } from "next-intl";
import { PopCard } from "@/components/ui/pop-card";
import { type PersonalStats } from "./types";

type PersonalStatsSectionProps = {
  stats: PersonalStats | null;
};

export function PersonalStatsSection({ stats }: PersonalStatsSectionProps) {
  const t = useTranslations("mypage.stats");

  if (!stats) {
    return (
      <PopCard tone="muted">
        <p className="text-sm text-[var(--color-text-secondary)]">{t("loading")}</p>
      </PopCard>
    );
  }

  return (
    <PopCard tone="surface" className="space-y-4">
      <div>
        <h2 className="text-movie-title text-[1.35rem]">{t("title")}</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">{t("description")}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-sm">
          <p className="text-xs text-[var(--color-text-secondary)] mb-0.5">{t("watched")}</p>
          <p className="font-[500] text-[var(--color-text-primary)]">{stats.totals.watchedCount}</p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-sm">
          <p className="text-xs text-[var(--color-text-secondary)] mb-0.5">{t("watchlist")}</p>
          <p className="font-[500] text-[var(--color-text-primary)]">{stats.totals.watchlistCount}</p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-sm">
          <p className="text-xs text-[var(--color-text-secondary)] mb-0.5">{t("thisMonth")}</p>
          <p className="font-[500] text-[var(--color-text-primary)]">{stats.totals.watchedThisMonth}</p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-sm">
          <p className="text-xs text-[var(--color-text-secondary)] mb-0.5">{t("movies")}</p>
          <p className="font-[500] text-[var(--color-text-primary)]">{stats.totals.moviesCount}</p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-sm">
          <p className="text-xs text-[var(--color-text-secondary)] mb-0.5">{t("dramas")}</p>
          <p className="font-[500] text-[var(--color-text-primary)]">{stats.totals.dramasCount}</p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-sm">
          <p className="text-xs text-[var(--color-text-secondary)] mb-0.5">{t("avgRating")}</p>
          <p className="font-[500] text-[var(--color-accent)]">
            {stats.totals.averageRating ? stats.totals.averageRating.toFixed(1) : "—"}
          </p>
        </div>
      </div>
      <div className="space-y-1.5 text-xs text-[var(--color-text-secondary)]">
        <p>
          <span className="text-[var(--color-text-muted)] mr-1">{t("topGenres")}:</span>
          {stats.topGenres.map((item) => `${item.name}(${item.count})`).join(" / ") || "—"}
        </p>
        <p>
          <span className="text-[var(--color-text-muted)] mr-1">{t("topDirectors")}:</span>
          {stats.topDirectors.map((item) => `${item.name}(${item.count})`).join(" / ") || "—"}
        </p>
        <p>
          <span className="text-[var(--color-text-muted)] mr-1">{t("topActors")}:</span>
          {stats.topActors.map((item) => `${item.name}(${item.count})`).join(" / ") || "—"}
        </p>
      </div>
    </PopCard>
  );
}
