"use client";

import Link from "next/link";
import { useState } from "react";

type Movie = {
  id: string;
  title: string;
  releaseYear: number;
  genrePrimary: string;
  directors: string[];
  reviewScore: number | null;
  moodTags: string[];
  runtimeMinutes: number;
};

type Props = {
  movies: Movie[];
  genres: string[];
  moodTags: string[];
};

export function DiscoverClient({ movies, genres, moodTags }: Props) {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = movies.filter((m) => {
    if (selectedGenre && m.genrePrimary !== selectedGenre) return false;
    if (selectedMood && !m.moodTags.includes(selectedMood)) return false;
    if (searchQuery && !m.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const pillClass = (active: boolean) =>
    `credits-label rounded-full border px-3 py-1 transition cursor-pointer ${
      active
        ? "border-[var(--color-border-accent)] text-[var(--color-accent)]"
        : "border-[var(--color-border)] hover:border-[var(--color-border-accent)]"
    }`;

  return (
    <div className="space-y-8">
      {/* Search */}
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="タイトルで検索..."
        className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-border-accent)] focus:outline-none"
      />

      {/* Genre filter */}
      <div>
        <p className="credits-label mb-3">ジャンル</p>
        <div className="flex flex-wrap gap-2">
          <button className={pillClass(!selectedGenre)} onClick={() => setSelectedGenre(null)}>すべて</button>
          {genres.map((g) => (
            <button key={g} className={pillClass(selectedGenre === g)} onClick={() => setSelectedGenre(selectedGenre === g ? null : g)}>
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Mood filter */}
      <div>
        <p className="credits-label mb-3">ムード</p>
        <div className="flex flex-wrap gap-2">
          <button className={pillClass(!selectedMood)} onClick={() => setSelectedMood(null)}>すべて</button>
          {moodTags.map((m) => (
            <button key={m} className={pillClass(selectedMood === m)} onClick={() => setSelectedMood(selectedMood === m ? null : m)}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div>
        <p className="credits-label mb-4">{filtered.length} 件</p>
        <div className="space-y-2">
          {filtered.map((movie, i) => (
            <Link
              key={movie.id}
              href={`/movies/${movie.id}`}
              className="nostalgia-result-item group flex items-center gap-4 rounded-[var(--radius-md)] border border-transparent px-2 py-1 transition hover:border-[var(--color-border)] hover:bg-[var(--color-bg-surface)]"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <span className="credits-label w-6 shrink-0 text-right">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="credits-name truncate text-sm transition group-hover:text-[var(--color-accent)]">
                  {movie.title}
                </p>
                <p className="credits-label mt-0.5 truncate">
                  {movie.directors[0] ?? "—"} · {movie.releaseYear} · {movie.runtimeMinutes}min
                </p>
              </div>
              {movie.reviewScore != null && (
                <span className="credits-label shrink-0 text-[var(--color-accent)]">
                  {movie.reviewScore.toFixed(1)}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
