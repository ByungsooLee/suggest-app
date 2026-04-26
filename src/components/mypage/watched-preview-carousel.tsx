"use client";

import Link from "next/link";

import { PopButton } from "@/components/ui/pop-button";
import { PopCard } from "@/components/ui/pop-card";

import { type WatchedItem } from "./types";

type WatchedPreviewCarouselProps = {
  items: WatchedItem[];
};

export function WatchedPreviewCarousel({ items }: WatchedPreviewCarouselProps) {
  const recentItems = items.slice(0, 10);

  return (
    <PopCard tone="highlight" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-heading">Library Preview</p>
          <h2 className="text-movie-title text-[1.35rem]">Watched Library</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">最近観た作品 {items.length} 本</p>
        </div>
        <Link href="/mypage/library" className="text-xs text-[var(--color-accent)] hover:opacity-80">
          すべて見る
        </Link>
      </div>

      {recentItems.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] p-4 text-sm text-[var(--color-text-secondary)]">
          まだ視聴ライブラリが空です。検索追加かクイック分類で、気軽に埋めていきましょう。
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
          <PopButton variant="secondary" className="w-full">
            すべて見る
          </PopButton>
        </Link>
        <Link href="/mypage/library/add" className="block">
          <PopButton variant="secondary" className="w-full">
            視聴済みを登録
          </PopButton>
        </Link>
        <Link href="/mypage/library/quick-add" className="block">
          <PopButton className="w-full">クイック分類</PopButton>
        </Link>
      </div>
    </PopCard>
  );
}
