"use client";

import { PopCard } from "@/components/ui/pop-card";

import { type RecommendationHistoryItem } from "./types";

type RecommendationHistorySectionProps = {
  items: RecommendationHistoryItem[];
};

const STATUS_LABEL: Record<RecommendationHistoryItem["status"], string> = {
  recommended: "提案のみ",
  saved: "保存済み",
  watched: "視聴済み",
  skipped: "スキップ",
};

export function RecommendationHistorySection({ items }: RecommendationHistorySectionProps) {
  return (
    <PopCard tone="surface" className="space-y-4">
      <div>
        <h2 className="text-movie-title text-[1.35rem]">Recommendation History</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">最近の提案と、その後のアクションを確認できます。</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] p-4 text-sm text-[var(--color-text-secondary)]">
          まだ推薦履歴がありません。おすすめを1回作成するとここに表示されます。
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
              <span className="rounded-full border border-[var(--color-border)] px-2.5 py-1 text-xs">{STATUS_LABEL[item.status]}</span>
            </article>
          ))}
        </div>
      )}
    </PopCard>
  );
}
