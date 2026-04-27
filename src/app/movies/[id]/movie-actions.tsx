"use client";

import { useState } from "react";

type Props = {
  movieId: string;
  title: string;
  posterUrl: string | null;
};

export function MovieActions({ movieId, title, posterUrl }: Props) {
  const [watchedDone, setWatchedDone] = useState(false);
  const [watchlistDone, setWatchlistDone] = useState(false);

  const markWatched = async () => {
    if (watchedDone) return;
    await fetch("/api/me/watched", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieId, source: "manual", reaction: "normal" }),
    });
    setWatchedDone(true);
  };

  const addWatchlist = async () => {
    if (watchlistDone) return;
    await fetch("/api/me/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieId, title, posterUrl, source: "manual", contentType: "movie" }),
    });
    setWatchlistDone(true);
  };

  const btnClass =
    "credits-label rounded-full border border-[var(--color-border)] px-4 py-2 transition hover:border-[var(--color-border-accent)] hover:text-[var(--color-accent)] disabled:opacity-50";

  return (
    <div className="mt-8 mb-2 flex gap-3">
      <button className={btnClass} disabled={watchedDone} onClick={markWatched}>
        {watchedDone ? "✓ 視聴済み" : "+ 視聴済みに追加"}
      </button>
      <button className={btnClass} disabled={watchlistDone} onClick={addWatchlist}>
        {watchlistDone ? "✓ リストに追加" : "あとで見る"}
      </button>
    </div>
  );
}
