"use client";

import { useTranslations } from "next-intl";
import { PopCard } from "@/components/ui/pop-card";
import { type RecommendationHistoryItem } from "./types";

type RecommendationHistorySectionProps = {
  items: RecommendationHistoryItem[];
};

export function RecommendationHistorySection({ items }: RecommendationHistorySectionProps) {
  const t = useTranslations("mypage.history");
  const statusLabel = (status: RecommendationHistoryItem["status"]) =>
    t(`status.${status}` as Parameters<typeof t>[0]);

  return (
    <PopCard tone="surface" className="space-y-4">
      <div>
        <h2 className="text-movie-title text-[1.35rem]">{t("title")}</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">{t("description")}</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] p-4 text-sm text-[var(--color-text-secondary)]">
          {t("empty")}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <article
              key={item.id}
              className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-2.5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.posterUrl ?? "/images/no-poster.svg"}
                alt={item.title}
                className="h-16 w-11 rounded-[var(--radius-sm)] object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-[500]">{item.title}</p>
                <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                  #{item.rank} ・ {new Date(item.recommendedAt).toLocaleDateString("ja-JP")}
                </p>
                <p className="mt-1 line-clamp-1 text-xs text-[var(--color-text-secondary)]">{item.reasons.join(" / ")}</p>
              </div>
              <span className="rounded-full border border-[var(--color-border)] px-2.5 py-1 text-xs">{statusLabel(item.status)}</span>
            </article>
          ))}
        </div>
      )}
    </PopCard>
  );
}
