"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Movie = {
  id: string;
  title: string;
  releaseYear: number;
  genrePrimary: string;
  posterUrl: string | null;
  directors: string[];
  reviewScore: number | null;
};

type Props = {
  movies: Movie[];
  genres: string[];
};

export function CreditsBrowser({ movies, genres }: Props) {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = movies.filter(
    (m) =>
      (!selectedGenre || m.genrePrimary === selectedGenre) &&
      (!searchQuery || m.title.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const looped = [...filtered, ...filtered];

  const speedButtonClass = (s: number) =>
    `credits-label rounded-full border px-2 py-1 transition ${
      speed === s
        ? "border-[var(--color-border-accent)] text-[var(--color-accent)]"
        : "border-[var(--color-border)] hover:border-[var(--color-border-accent)]"
    }`;

  const genreButtonClass = (g: string | null) =>
    `credits-label rounded-full border px-3 py-1 transition ${
      selectedGenre === g
        ? "border-[var(--color-border-accent)] text-[var(--color-accent)]"
        : "border-[var(--color-border)] hover:border-[var(--color-border-accent)]"
    }`;

  return (
    <>
      {/* Fixed top bar */}
      <div className="fixed inset-x-0 top-0 z-20 flex items-center gap-4 bg-[rgba(8,8,8,0.9)] px-6 py-3 backdrop-blur">
        <span className="credits-label shrink-0">BROWSE</span>

        <div className="flex flex-1 gap-2 overflow-x-auto">
          <button className={genreButtonClass(null)} onClick={() => setSelectedGenre(null)}>
            すべて
          </button>
          {genres.map((genre) => (
            <button
              key={genre}
              className={genreButtonClass(genre)}
              onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
            >
              {genre}
            </button>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="検索..."
            className="w-28 rounded-full border border-[var(--color-border)] bg-transparent px-3 py-1 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-border-accent)] focus:outline-none"
          />
          <button
            className="credits-label rounded-full border border-[var(--color-border)] px-3 py-1 transition hover:border-[var(--color-border-accent)]"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button className={speedButtonClass(0.5)} onClick={() => setSpeed(0.5)}>slow</button>
          <button className={speedButtonClass(1)} onClick={() => setSpeed(1)}>normal</button>
          <button className={speedButtonClass(3)} onClick={() => setSpeed(3)}>fast</button>
        </div>
      </div>

      {/* Scrolling credits */}
      <div className="h-screen overflow-hidden pt-16">
        <div
          className={isPlaying ? "credits-roll-active" : "credits-roll-paused"}
          style={{ "--roll-duration": `${200 / speed}s` } as React.CSSProperties}
        >
          {looped.map((movie, i) => (
            <button
              key={`${movie.id}-${i}`}
              className="group relative w-full py-3 text-center"
              onClick={() => router.push(`/movies/${movie.id}`)}
              onMouseEnter={() => setHoveredId(movie.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <p className="credits-name text-lg transition group-hover:text-[var(--color-accent)]">
                {movie.title}
              </p>
              <p className="credits-label mt-0.5">
                {movie.directors[0] ?? "Unknown"} · {movie.releaseYear}
              </p>
              {hoveredId === movie.id && movie.posterUrl && (
                <div className="absolute left-[10%] top-1/2 h-16 w-12 -translate-y-1/2 overflow-hidden rounded opacity-0 transition-all duration-300 group-hover:opacity-70">
                  <Image src={movie.posterUrl} alt="" fill className="object-cover" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
