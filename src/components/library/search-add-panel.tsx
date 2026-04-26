"use client";

import { useMemo, useState } from "react";

import { PopButton } from "@/components/ui/pop-button";
import { PopCard } from "@/components/ui/pop-card";

type SearchCandidate = {
  id: string;
  title: string;
  releaseYear: number | null;
  contentType: "movie" | "drama";
  posterUrl: string | null;
  overview: string | null;
  directors: string[];
  cast: string[];
  genrePrimary: string | null;
};

type SearchResponse = {
  items: SearchCandidate[];
  nextCursor: string | null;
};

type ReactionMode = "like" | "normal" | "dislike";

export function SearchAddPanel() {
  const [q, setQ] = useState("");
  const [actor, setActor] = useState("");
  const [director, setDirector] = useState("");
  const [type, setType] = useState<"movie" | "drama">("movie");
  const [reaction, setReaction] = useState<ReactionMode>("normal");
  const [items, setItems] = useState<SearchCandidate[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set("type", type);
    if (q.trim()) params.set("q", q.trim());
    if (actor.trim()) params.set("actor", actor.trim());
    if (director.trim()) params.set("director", director.trim());
    return params.toString();
  }, [actor, director, q, type]);

  const runSearch = async (cursor?: string | null) => {
    setLoading(true);
    setMessage("");
    const params = new URLSearchParams(query);
    if (cursor) params.set("cursor", cursor);
    const response = await fetch(`/api/me/library/search-candidates?${params.toString()}`, { cache: "no-store" });
    setLoading(false);
    if (!response.ok) {
      setMessage("検索に失敗しました。");
      return;
    }
    const payload = (await response.json()) as SearchResponse;
    setItems((prev) => (cursor ? [...prev, ...payload.items] : payload.items));
    setNextCursor(payload.nextCursor);
  };

  const addToLibrary = async (item: SearchCandidate) => {
    const response = await fetch("/api/me/watched", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentType: item.contentType,
        movieId: item.id,
        watched: true,
        reaction,
        catalogSource: "search_add",
        quickConfidence: 95,
      }),
    });
    if (!response.ok) {
      setMessage("ライブラリ追加に失敗しました。");
      return;
    }
    setMessage(`追加: ${item.title}`);
  };

  return (
    <div className="space-y-4">
      <PopCard tone="surface" className="space-y-3">
        <p className="text-heading">Search Add</p>
        <h2 className="text-movie-title text-[1.25rem]">検索して追加</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm"
            placeholder="タイトル"
          />
          <select
            value={type}
            onChange={(event) => setType(event.target.value as "movie" | "drama")}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm"
          >
            <option value="movie">映画</option>
            <option value="drama">ドラマ</option>
          </select>
          <input
            value={actor}
            onChange={(event) => setActor(event.target.value)}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm"
            placeholder="俳優"
          />
          <input
            value={director}
            onChange={(event) => setDirector(event.target.value)}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm"
            placeholder="監督"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--color-text-secondary)]">リアクション:</span>
          {[
            { id: "like", label: "好き" },
            { id: "normal", label: "ふつう" },
            { id: "dislike", label: "合わない" },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setReaction(option.id as ReactionMode)}
              className={`rounded-[var(--radius-full)] border px-3 py-1 text-xs ${
                reaction === option.id
                  ? "border-[var(--color-border-accent)] bg-[var(--color-accent-dim)] text-[var(--color-accent)]"
                  : "border-[var(--color-border)] text-[var(--color-text-secondary)]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <PopButton onClick={() => void runSearch(null)} disabled={loading}>
          {loading ? "検索中..." : "検索"}
        </PopButton>
        {message ? <p className="text-xs text-[var(--color-text-secondary)]">{message}</p> : null}
      </PopCard>

      <PopCard tone="surface">
        {items.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)]">検索して候補を表示します。</p>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.posterUrl ?? "/images/no-poster.svg"} alt={item.title} className="h-52 w-full object-cover" />
                  <div className="space-y-2 p-3">
                    <p className="line-clamp-2 text-sm font-[500] text-[var(--color-text-primary)]">{item.title}</p>
                    <p className="text-[11px] text-[var(--color-text-secondary)]">
                      {item.releaseYear ?? "-"} / {item.genrePrimary ?? "-"}
                    </p>
                    <p className="line-clamp-2 text-xs text-[var(--color-text-secondary)]">{item.overview ?? "概要なし"}</p>
                    <PopButton variant="secondary" onClick={() => void addToLibrary(item)} className="w-full">
                      視聴済みに追加
                    </PopButton>
                  </div>
                </article>
              ))}
            </div>
            {nextCursor ? (
              <PopButton variant="ghost" onClick={() => void runSearch(nextCursor)} disabled={loading}>
                さらに表示
              </PopButton>
            ) : null}
          </div>
        )}
      </PopCard>
    </div>
  );
}
