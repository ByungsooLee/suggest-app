"use client";

import { useMemo, useState } from "react";

import { PopButton } from "@/components/ui/pop-button";
import { PopCard } from "@/components/ui/pop-card";

import { type WatchedContentType, type WatchedItem } from "./types";

type WatchedContentSectionProps = {
  items: WatchedItem[];
  onAdded: (item: WatchedItem) => void;
  onRemoved: (itemId: string) => void;
  onUpdated: (item: WatchedItem) => void;
};

export function WatchedContentSection({ items, onAdded, onRemoved, onUpdated }: WatchedContentSectionProps) {
  const [filter, setFilter] = useState<"all" | WatchedContentType>("all");
  const [contentType, setContentType] = useState<WatchedContentType>("movie");
  const [title, setTitle] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [addMemo, setAddMemo] = useState("");
  const [addRating, setAddRating] = useState<number | "">("");
  const [addReaction, setAddReaction] = useState<WatchedItem["reaction"]>(null);
  const [addSource, setAddSource] = useState<WatchedItem["watchSource"]>(null);
  const [addRewatch, setAddRewatch] = useState(false);
  const [addWatchedAt, setAddWatchedAt] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMemo, setEditMemo] = useState("");
  const [editRating, setEditRating] = useState<number | "">("");
  const [editReaction, setEditReaction] = useState<WatchedItem["reaction"]>(null);
  const [editSource, setEditSource] = useState<WatchedItem["watchSource"]>(null);
  const [editRewatch, setEditRewatch] = useState(false);

  const filteredItems = useMemo(
    () => (filter === "all" ? items : items.filter((item) => item.contentType === filter)),
    [items, filter],
  );

  const addItem = async () => {
    setState("saving");
    setMessage("");
    try {
      const response = await fetch("/api/me/watched", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          title: title.trim(),
          posterUrl: posterUrl.trim() || undefined,
          watched: true,
          watchedAt: addWatchedAt ? new Date(addWatchedAt).toISOString() : undefined,
          ratingScore: addRating === "" ? undefined : addRating,
          reaction: addReaction ?? undefined,
          watchSource: addSource ?? undefined,
          memo: addMemo.trim() || undefined,
          rewatch: addRewatch,
        }),
      });
      const payload = (await response.json()) as { item?: WatchedItem; message?: string };
      if (!response.ok || !payload.item) {
        throw new Error(payload.message ?? "追加に失敗しました。");
      }
      onAdded(payload.item);
      setTitle("");
      setPosterUrl("");
      setAddMemo("");
      setAddRating("");
      setAddReaction(null);
      setAddSource(null);
      setAddRewatch(false);
      setAddWatchedAt("");
      setState("idle");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "追加に失敗しました。");
    }
  };

  const removeItem = async (itemId: string) => {
    const response = await fetch(`/api/me/watched/${itemId}`, { method: "DELETE" });
    if (!response.ok) return;
    onRemoved(itemId);
  };

  const beginEdit = (item: WatchedItem) => {
    setEditingId(item.id);
    setEditMemo(item.memo ?? "");
    setEditRating(item.ratingScore ?? "");
    setEditReaction(item.reaction);
    setEditSource(item.watchSource);
    setEditRewatch(item.rewatch);
  };

  const saveEdit = async (item: WatchedItem) => {
    const response = await fetch(`/api/me/watched/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memo: editMemo || null,
        ratingScore: editRating === "" ? null : editRating,
        reaction: editReaction,
        watchSource: editSource,
        rewatch: editRewatch,
      }),
    });
    if (!response.ok) return;
    onUpdated({
      ...item,
      memo: editMemo || null,
      ratingScore: editRating === "" ? null : editRating,
      reaction: editReaction,
      watchSource: editSource,
      rewatch: editRewatch,
    });
    setEditingId(null);
  };

  return (
    <PopCard tone="highlight" className="space-y-4">
      <div>
        <h2 className="text-movie-title text-[1.35rem]">Watched Movies / Dramas</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">視聴済み作品をカードで管理します。</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: "all", label: "All" },
          { id: "movie", label: "Movies" },
          { id: "drama", label: "Dramas" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id as "all" | WatchedContentType)}
            className={`rounded-[var(--radius-full)] border px-3 py-1.5 text-xs ${
              filter === tab.id
                ? "border-[var(--color-border-accent)] bg-[var(--color-accent-dim)] text-[var(--color-accent)]"
                : "border-[var(--color-border)] text-[var(--color-text-secondary)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] p-4 text-sm text-[var(--color-text-secondary)]">
          まだ視聴履歴がありません。下から映画/ドラマを追加すると、My Pageに蓄積されます。
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filteredItems.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.posterUrl ?? "/images/no-poster.svg"} alt={item.title} className="h-36 w-full object-cover" />
              <div className="space-y-2 p-2.5">
                <p className="line-clamp-2 text-sm font-[500]">{item.title}</p>
                <p className="text-[11px] uppercase tracking-wide text-[var(--color-text-secondary)]">{item.contentType}</p>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[var(--color-accent-dim)] px-2 py-0.5 text-[10px] text-[var(--color-accent)]">
                    {item.watched ? "Watched" : "Planned"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => beginEdit(item)}
                      className="text-[11px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                    >
                      編集
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-[11px] text-[var(--color-text-secondary)] hover:text-rose-400"
                    >
                      削除
                    </button>
                  </div>
                </div>
                <div className="space-y-1 text-[10px] text-[var(--color-text-secondary)]">
                  <p>rating: {item.ratingScore ?? "-"}</p>
                  <p>reaction: {item.reaction ?? "-"}</p>
                  <p>source: {item.watchSource ?? "-"}</p>
                </div>
                {editingId === item.id ? (
                  <div className="space-y-2 rounded-[var(--radius-md)] border border-[var(--color-border)] p-2">
                    <textarea
                      value={editMemo}
                      onChange={(event) => setEditMemo(event.target.value)}
                      rows={2}
                      className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-2 py-1 text-xs"
                      placeholder="ひとことメモ"
                    />
                    <div className="grid grid-cols-2 gap-1">
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={editRating}
                        onChange={(event) => {
                          const next = event.target.value;
                          setEditRating(next === "" ? "" : Number(next));
                        }}
                        className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-2 py-1 text-xs"
                        placeholder="1-5"
                      />
                      <select
                        value={editReaction ?? ""}
                        onChange={(event) => setEditReaction((event.target.value || null) as WatchedItem["reaction"])}
                        className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-2 py-1 text-xs"
                      >
                        <option value="">reaction</option>
                        <option value="like">like</option>
                        <option value="normal">normal</option>
                        <option value="dislike">dislike</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <select
                        value={editSource ?? ""}
                        onChange={(event) => setEditSource((event.target.value || null) as WatchedItem["watchSource"])}
                        className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-2 py-1 text-xs"
                      >
                        <option value="">source</option>
                        <option value="netflix">Netflix</option>
                        <option value="prime_video">Prime Video</option>
                        <option value="cinema">Cinema</option>
                        <option value="other">Other</option>
                      </select>
                      <label className="flex items-center gap-1 text-xs">
                        <input type="checkbox" checked={editRewatch} onChange={(event) => setEditRewatch(event.target.checked)} />
                        rewatch
                      </label>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => saveEdit(item)}
                        className="rounded-[var(--radius-sm)] border border-[var(--color-border-accent)] px-2 py-1 text-[10px] text-[var(--color-accent)]"
                      >
                        保存
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1 text-[10px]"
                      >
                        閉じる
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="space-y-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3">
        <p className="text-xs text-[var(--color-text-secondary)]">手動追加</p>
        <div className="flex gap-2">
          <select
            value={contentType}
            onChange={(event) => setContentType(event.target.value as WatchedContentType)}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-2 text-sm"
          >
            <option value="movie">Movie</option>
            <option value="drama">Drama</option>
          </select>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="タイトル"
            className="min-w-0 flex-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm"
          />
        </div>
        <input
          value={posterUrl}
          onChange={(event) => setPosterUrl(event.target.value)}
          placeholder="ポスターURL（任意）"
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={addWatchedAt}
            onChange={(event) => setAddWatchedAt(event.target.value)}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm"
          />
          <input
            type="number"
            min={1}
            max={5}
            value={addRating}
            onChange={(event) => {
              const next = event.target.value;
              setAddRating(next === "" ? "" : Number(next));
            }}
            placeholder="rating 1-5"
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={addReaction ?? ""}
            onChange={(event) => setAddReaction((event.target.value || null) as WatchedItem["reaction"])}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm"
          >
            <option value="">reaction</option>
            <option value="like">like</option>
            <option value="normal">normal</option>
            <option value="dislike">dislike</option>
          </select>
          <select
            value={addSource ?? ""}
            onChange={(event) => setAddSource((event.target.value || null) as WatchedItem["watchSource"])}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm"
          >
            <option value="">watch source</option>
            <option value="netflix">Netflix</option>
            <option value="prime_video">Prime Video</option>
            <option value="cinema">Cinema</option>
            <option value="other">Other</option>
          </select>
        </div>
        <textarea
          value={addMemo}
          onChange={(event) => setAddMemo(event.target.value)}
          rows={2}
          placeholder="ひとことメモ"
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
          <input type="checkbox" checked={addRewatch} onChange={(event) => setAddRewatch(event.target.checked)} />
          Rewatch
        </label>
        {message ? <p className="text-xs text-rose-500">{message}</p> : null}
        <PopButton onClick={addItem} disabled={state === "saving" || !title.trim()}>
          {state === "saving" ? "追加中..." : "視聴済みに追加"}
        </PopButton>
      </div>
    </PopCard>
  );
}
