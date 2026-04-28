"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PopButton } from "@/components/ui/pop-button";
import { PopCard } from "@/components/ui/pop-card";
import { type WatchedItem } from "./types";

type WatchedPreviewCarouselProps = {
  items: WatchedItem[];
};

export function WatchedPreviewCarousel({ items }: WatchedPreviewCarouselProps) {
  const t = useTranslations("mypage.library");
  const recentItems = items.slice(0, 10);

  return (
    <PopCard tone="highlight" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-heading">{t("previewLabel")}</p>
          <h2 className="text-movie-title text-[1.35rem]">{t("title")}</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">{t("recentCount", { count: items.length })}</p>
        </div>
        <Link href="/mypage/library" className="text-xs text-[var(--color-accent)] hover:opacity-80">
          {t("viewAll")}
        </Link>
      </div>

      {recentItems.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] p-4 text-sm text-[var(--color-text-secondary)]">
          {t("empty")}
        </div>
      ) : (
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
          {recentItems.map((item) => (
            <Link
              key={item.id}
              href="/mypage/library"
              className="group w-28 shrink-0 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-surface)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.posterUrl ?? "/images/no-poster.svg"}
                alt={item.title}
                className="h-40 w-full object-cover transition duration-200 group-hover:scale-[1.02]"
              />
              <div className="p-2">
                <p className="line-clamp-2 text-xs text-[var(--color-text-primary)]">{item.title}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-3">
        <Link href="/mypage/library" className="block">
          <PopButton variant="secondary" className="w-full">{t("viewAll")}</PopButton>
        </Link>
        <Link href="/mypage/library/add" className="block">
          <PopButton variant="secondary" className="w-full">{t("addWatched")}</PopButton>
        </Link>
        <Link href="/mypage/library/quick-add" className="block">
          <PopButton className="w-full">{t("quickAdd")}</PopButton>
        </Link>
      </div>
    </PopCard>
  );
}
