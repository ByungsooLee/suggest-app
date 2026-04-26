"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { PopButton } from "@/components/ui/pop-button";
import { PopCard } from "@/components/ui/pop-card";
import { type WatchedItem } from "@/components/mypage/types";

type SortMode = "recently_added" | "watched_date" | "reaction" | "release_year";
type FilterMode = "all" | "movie" | "drama";

type WatchedResponse = { items: WatchedItem[] };

export function LibraryPageClient() {
  const [items, setItems] = useState<WatchedItem[]>([]);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [sort, setSort] = useState<SortMode>("recently_added");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<WatchedItem | null>(null);
  const [patching, setPatching] = useState(false);
  const [message, setMessage] = useState("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("type", filter);
    params.set("sort", sort);
    if (q.trim()) params.set("q", q.trim());
    return params.toString();
  }, [filter, sort, q]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const response = await fetch(`/api/me/watched?${queryString}`, { cache: "no-store" });
      if (!response.ok) {
        if (!cancelled) setLoading(false);
        return;
      }
      const payload = (await response.json()) as WatchedResponse;
      if (!cancelled) {
        setItems(payload.items);
        setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [queryString]);

  const saveSelectedItem = async () => {
    if (!selectedItem) return;
    setPatching(true);
    setMessage("");
    const response = await fetch(`/api/me/watched/${selectedItem.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        watchedAt: selectedItem.watchedAt,
        reaction: selectedItem.reaction,
        ratingScore: selectedItem.ratingScore,
        memo: selectedItem.memo,
        rewatch: selectedItem.rewatch,
        watched: selectedItem.watched,
      }),
    });
    setPatching(false);
    if (!response.ok) {
      setMessage("保存に失敗しました。");
      return;
    }
    setItems((prev) => prev.map((item) => (item.id === selectedItem.id ? selectedItem : item)));
    setMessage("保存しました。");
  };

  const removeItem = async (itemId: string) => {
    const response = await fetch(`/api/me/watched/${itemId}`, { method: "DELETE" });
    if (!response.ok) return;
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    if (selectedItem?.id === itemId) setSelectedItem(null);
  };

  return (
    <div className="space-y-4">
      <PopCard tone="surface" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-heading">My Library</p>
            <h2 className="text-movie-title text-[1.4rem]">わたしのシネマウォール</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">観た作品をポスターで管理し、好み学習に使います。</p>
          </div>
          <div className="flex gap-2">
            <Link href="/mypage/library/add">
              <PopButton variant="secondary">視聴済みを登録</PopButton>
            </Link>
            <Link href="/mypage/library/quick-add">
              <PopButton>クイック分類</PopButton>
            </Link>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-4">
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as FilterMode)}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm"
          >
            <option value="all">すべて</option>
            <option value="movie">映画</option>
            <option value="drama">ドラマ</option>
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortMode)}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm"
          >
            <option value="recently_added">追加が新しい順</option>
            <option value="watched_date">視聴日が新しい順</option>
            <option value="reaction">リアクション順</option>
            <option value="release_year">公開年が新しい順</option>
          </select>
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            className="sm:col-span-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm"
            placeholder="タイトル検索"
          />
        </div>
      </PopCard>

      <PopCard tone="surface">
        {loading ? (
          <p className="text-sm text-[var(--color-text-secondary)]">読み込み中...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)]">まだ作品がありません。追加フローから登録してください。</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {items.map((item) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-surface)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.posterUrl ?? "/images/no-poster.svg"} alt={item.title} className="h-48 w-full object-cover transition duration-200 group-hover:scale-[1.02]" />
                <div className="space-y-2 p-2.5">
                  <p className="line-clamp-2 text-sm font-[500] text-[var(--color-text-primary)]">{item.title}</p>
                  <p className="text-[11px] text-[var(--color-text-secondary)]">
                    {item.reaction === "like" ? "好き" : item.reaction === "dislike" ? "合わない" : "ニュートラル"}
                  </p>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      className="rounded-[var(--radius-sm)] border border-[var(--color-border-accent)] px-2 py-1 text-[11px] text-[var(--color-accent)]"
                    >
                      編集
                    </button>
                    <button
                      type="button"
                      onClick={() => void removeItem(item.id)}
                      className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1 text-[11px]"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </PopCard>

      {selectedItem ? (
        <PopCard tone="highlight" className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-heading">Edit</p>
              <h3 className="text-base font-[500]">視聴履歴を編集</h3>
            </div>
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              閉じる
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <select
              value={selectedItem.reaction ?? ""}
              onChange={(event) => setSelectedItem((prev) => (prev ? { ...prev, reaction: (event.target.value || null) as WatchedItem["reaction"] } : prev))}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm"
            >
              <option value="">ニュートラル</option>
              <option value="like">好き</option>
              <option value="normal">ふつう</option>
              <option value="dislike">合わない</option>
            </select>
            <input
              type="number"
              min={1}
              max={5}
              value={selectedItem.ratingScore ?? ""}
              onChange={(event) =>
                setSelectedItem((prev) =>
                  prev ? { ...prev, ratingScore: event.target.value === "" ? null : Number(event.target.value) } : prev,
                )
              }
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm"
              placeholder="評価 1-5"
            />
            <input
              type="datetime-local"
              value={selectedItem.watchedAt ? selectedItem.watchedAt.slice(0, 16) : ""}
              onChange={(event) =>
                setSelectedItem((prev) =>
                  prev ? { ...prev, watchedAt: event.target.value ? new Date(event.target.value).toISOString() : null } : prev,
                )
              }
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={selectedItem.rewatch}
                onChange={(event) => setSelectedItem((prev) => (prev ? { ...prev, rewatch: event.target.checked } : prev))}
              />
              再視聴
            </label>
          </div>
          <textarea
            value={selectedItem.memo ?? ""}
            onChange={(event) => setSelectedItem((prev) => (prev ? { ...prev, memo: event.target.value || null } : prev))}
            rows={3}
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm"
            placeholder="メモ"
          />
          <div className="flex gap-2">
            <PopButton onClick={() => void saveSelectedItem()} disabled={patching}>
              {patching ? "保存中..." : "保存"}
            </PopButton>
            {message ? <p className="text-xs text-[var(--color-text-secondary)]">{message}</p> : null}
          </div>
        </PopCard>
      ) : null}
    </div>
  );
}
