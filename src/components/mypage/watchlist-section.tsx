"use client";

import { useMemo, useState } from "react";

import { PopButton } from "@/components/ui/pop-button";
import { PopCard } from "@/components/ui/pop-card";

import { type WatchedItem, type WatchlistItem } from "./types";

type WatchlistSectionProps = {
  items: WatchlistItem[];
  onAdded: (item: WatchlistItem) => void;
  onRemoved: (id: string) => void;
  onMovedToWatched: (id: string, item: WatchedItem | null) => void;
};

export function WatchlistSection({ items, onAdded, onRemoved, onMovedToWatched }: WatchlistSectionProps) {
  const [title, setTitle] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");
  const sorted = useMemo(() => [...items].sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1)), [items]);

  const addItem = async () => {
    setState("saving");
    setMessage("");
    try {
      const response = await fetch("/api/me/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: "movie",
          title: title.trim(),
          posterUrl: posterUrl.trim() || undefined,
          source: "manual",
        }),
      });
      const payload = (await response.json()) as { item?: WatchlistItem; message?: string };
      if (!response.ok || !payload.item) throw new Error(payload.message ?? "保存に失敗しました。");
      onAdded(payload.item);
      setTitle("");
      setPosterUrl("");
      setState("idle");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "保存に失敗しました。");
    }
  };

  const removeItem = async (id: string) => {
    const response = await fetch(`/api/me/watchlist/${id}`, { method: "DELETE" });
    if (response.ok) onRemoved(id);
  };

  const moveToWatched = async (id: string) => {
    const response = await fetch(`/api/me/watchlist/${id}/move-to-watched`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!response.ok) return;
    const payload = (await response.json()) as { item?: WatchedItem | null };
    onMovedToWatched(id, payload.item ?? null);
  };

  return (
    <PopCard tone="surface" className="space-y-4">
      <div>
        <h2 className="text-movie-title text-[1.35rem]">Watchlist</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">後で観たい作品を保存して、視聴済みに移動できます。</p>
      </div>
      {sorted.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] p-4 text-sm text-[var(--color-text-secondary)]">
          まだWatchlistが空です。推薦結果から「あとで観る」に保存すると、ここに蓄積されます。
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {sorted.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.posterUrl ?? "/images/no-poster.svg"} alt={item.title} className="h-36 w-full object-cover" />
              <div className="space-y-2 p-2.5">
                <p className="line-clamp-2 text-sm font-[500]">{item.title}</p>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveToWatched(item.id)}
                    className="rounded-[var(--radius-sm)] border border-[var(--color-border-accent)] px-2 py-1 text-[10px] text-[var(--color-accent)]"
                  >
                    視聴済みに移動
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1 text-[10px]"
                  >
                    削除
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      <div className="space-y-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3">
        <p className="text-xs text-[var(--color-text-secondary)]">手動追加</p>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm"
          placeholder="タイトル"
        />
        <input
          value={posterUrl}
          onChange={(event) => setPosterUrl(event.target.value)}
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm"
          placeholder="ポスターURL（任意）"
        />
        {message ? <p className="text-xs text-rose-500">{message}</p> : null}
        <PopButton onClick={addItem} disabled={state === "saving" || !title.trim()}>
          {state === "saving" ? "保存中..." : "Watchlistに追加"}
        </PopButton>
      </div>
    </PopCard>
  );
}
