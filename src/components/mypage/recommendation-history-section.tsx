"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { PopCard } from "@/components/ui/pop-card";
import { useMovieTitleLang } from "@/lib/i18n/lang-context";
import { getMovieTitle } from "@/lib/i18n/localized-movie";
import { type RecommendationHistoryItem } from "./types";

type RecommendationHistorySectionProps = {
  items?: RecommendationHistoryItem[];
  variant?: "preview" | "full";
  selfFetch?: boolean;
};

function RecommendationHistoryList({
  items,
  variant,
}: {
  items: RecommendationHistoryItem[];
  variant: "preview" | "full";
}) {
  const tHistory = useTranslations("mypage.history");
  const locale = useLocale();
  const { lang } = useMovieTitleLang();
  const statusLabel = (status: RecommendationHistoryItem["status"]) =>
    tHistory(`status.${status}` as Parameters<typeof tHistory>[0]);
  const visibleItems = variant === "preview" ? items.slice(0, 3) : items;

  return (
    <PopCard tone="surface" className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-movie-title text-[1.35rem]">{variant === "preview" ? tHistory("previewTitle") : tHistory("title")}</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {variant === "preview" ? tHistory("previewDescription") : tHistory("description")}
          </p>
        </div>
        {variant === "preview" && items.length > 0 && (
          <Link href="/history" className="shrink-0 text-xs font-[500] text-[var(--color-accent)] hover:opacity-80">
            {tHistory("viewAll")}
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] p-4 text-sm text-[var(--color-text-secondary)]">
          {tHistory("empty")}
        </div>
      ) : (
        <div className="space-y-2">
          {visibleItems.map((item) => {
            const title = getMovieTitle(item, lang);
            const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(item.recommendedAt));

            return (
              <Link
                key={item.id}
                href={`/recommend/result/${item.sessionId}`}
                className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-2.5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.posterUrl ?? "/images/no-poster.svg"}
                  alt={title}
                  className="h-16 w-11 rounded-[var(--radius-sm)] object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-[500]">{title}</p>
                  <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                    {tHistory("rank", { rank: item.rank })} ・ {date}
                  </p>
                  <p className="mt-1 line-clamp-1 text-xs text-[var(--color-accent)]">{tHistory("openRecord")}</p>
                </div>
                <span className="rounded-full border border-[var(--color-border)] px-2.5 py-1 text-xs">{statusLabel(item.status)}</span>
              </Link>
            );
          })}
        </div>
      )}
    </PopCard>
  );
}

function SelfFetchRecommendationHistory({ variant }: { variant: "preview" | "full" }) {
  const tMypage = useTranslations("mypage");
  const [items, setItems] = useState<RecommendationHistoryItem[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const load = async () => {
      setState("loading");
      try {
        const response = await fetch("/api/me/recommendation-history", { cache: "no-store" });
        if (!response.ok) throw new Error();
        const data = (await response.json()) as { items: RecommendationHistoryItem[] };
        setItems(data.items);
        setState("ready");
      } catch {
        setState("error");
      }
    };

    void load();
  }, []);

  if (state === "loading") {
    return (
      <PopCard tone="muted">
        <p className="text-sm text-[var(--color-text-secondary)]">{tMypage("loading")}</p>
      </PopCard>
    );
  }

  if (state === "error") {
    return (
      <PopCard tone="muted">
        <p className="text-sm text-rose-500">{tMypage("loadError")}</p>
      </PopCard>
    );
  }

  return <RecommendationHistoryList items={items} variant={variant} />;
}

export function RecommendationHistorySection({
  items = [],
  variant = "preview",
  selfFetch = false,
}: RecommendationHistorySectionProps) {
  if (selfFetch) {
    return <SelfFetchRecommendationHistory variant={variant} />;
  }

  return <RecommendationHistoryList items={items} variant={variant} />;
}
