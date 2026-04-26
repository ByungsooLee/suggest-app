"use client";

import { PopCard } from "@/components/ui/pop-card";

import { type TasteSummary } from "./types";

type TasteSummarySectionProps = {
  tasteSummary: TasteSummary | null;
};

export function TasteSummarySection({ tasteSummary }: TasteSummarySectionProps) {
  if (!tasteSummary) {
    return (
      <PopCard tone="muted">
        <p className="text-sm text-[var(--color-text-secondary)]">Taste Summaryを準備中です。</p>
      </PopCard>
    );
  }

  return (
    <PopCard tone="highlight" className="space-y-3">
      <div>
        <h2 className="text-movie-title text-[1.35rem]">Your Taste Summary</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">視聴履歴と嗜好設定から傾向を解釈しています。</p>
      </div>
      <p className="text-sm leading-relaxed">{tasteSummary.summary}</p>
      <div className="flex flex-wrap gap-2">
        {tasteSummary.signals.map((signal) => (
          <span key={signal} className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-1 text-xs">
            {signal}
          </span>
        ))}
      </div>
    </PopCard>
  );
}
