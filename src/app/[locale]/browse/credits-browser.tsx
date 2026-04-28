"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useState, useMemo } from "react";
import { useMovieTitleLang } from "@/lib/i18n/lang-context";
import { getMovieTitle } from "@/lib/movie-title";
import { LangSelector } from "@/components/lang-selector";

type Movie = {
  id: string;
  title: string;
  releaseYear: number;
  genrePrimary: string;
  posterUrl: string | null;
  directors: string[];
  reviewScore: number | null;
  localizedTitles: unknown;
  localizedData: unknown;
};

type Props = {
  movies: Movie[];
  genres: string[];
};

const genreLabel: Record<string, string> = {
  action: "アクション",
  adventure: "冒険",
  animation: "アニメ",
  comedy: "コメディ",
  crime: "犯罪",
  drama: "ドラマ",
  family: "ファミリー",
  fantasy: "ファンタジー",
  horror: "ホラー",
  mystery: "ミステリー",
  musical: "ミュージカル",
  romance: "ロマンス",
  "sci-fi": "SF",
  thriller: "スリラー",
};

function ScoreRing({ score }: { score: number }) {
  const radius = 13;
  const circ = 2 * Math.PI * radius;
  const dash = ((score / 10) * circ).toFixed(2);

  return (
    <div className="relative h-8 w-8 shrink-0">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 34 34">
        <circle cx="17" cy="17" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
        <circle
          cx="17" cy="17" r={radius}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="3"
          strokeDasharray={`${dash} ${circ.toFixed(2)}`}
          strokeLinecap="round"
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center"
        style={{ fontSize: "9px", fontWeight: 600, color: "var(--color-accent)", fontFamily: "var(--font-dm-sans)" }}
      >
        {score.toFixed(1)}
      </span>
    </div>
  );
}

export function CreditsBrowser({ movies, genres }: Props) {
  const t = useTranslations("browsePage");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "year">("score");
  const { lang } = useMovieTitleLang();

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return movies
      .filter(
        (m) =>
          (!selectedGenre || m.genrePrimary === selectedGenre) &&
          (!q ||
            getMovieTitle(m, lang).toLowerCase().includes(q) ||
            m.title.toLowerCase().includes(q) ||
            m.directors.some((d) => d.toLowerCase().includes(q))),
      )
      .sort((a, b) =>
        sortBy === "score"
          ? (b.reviewScore ?? 0) - (a.reviewScore ?? 0)
          : b.releaseYear - a.releaseYear,
      );
  }, [movies, selectedGenre, searchQuery, sortBy, lang]);

  return (
    <div className="min-h-screen">
      {/* Sticky header */}
      <div
        className="sticky top-0 z-20 border-b border-[var(--color-border)]"
        style={{ background: "rgba(8,8,8,0.96)", backdropFilter: "blur(12px)" }}
      >
        <div className="mx-auto max-w-5xl px-4 pt-4 pb-3 space-y-3">

          {/* Row 1: title + language selector */}
          <div className="flex items-center gap-3">
            <span className="credits-label shrink-0" style={{ color: "var(--color-accent)" }}>BROWSE</span>
            <div className="flex-1" />
            <LangSelector />
          </div>

          {/* Row 2: search + sort */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-1.5 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-border-accent)] focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                >
                  ×
                </button>
              )}
            </div>
            <button
              onClick={() => setSortBy(sortBy === "score" ? "year" : "score")}
              className="credits-label shrink-0 rounded-full border border-[var(--color-border)] px-3 py-1.5 transition hover:border-[var(--color-border-accent)]"
            >
              {sortBy === "score" ? t("sortScore") : t("sortYear")}
            </button>
          </div>

          {/* Row 3: genre chips */}
          <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {[null, ...genres].map((g) => (
              <button
                key={g ?? "__all__"}
                onClick={() => setSelectedGenre(g === selectedGenre ? null : g)}
                className="credits-label shrink-0 rounded-full border px-3 py-1 transition"
                style={
                  selectedGenre === g
                    ? { borderColor: "var(--color-border-accent)", color: "var(--color-accent)", background: "rgba(232,201,122,0.08)" }
                    : { borderColor: "var(--color-border)" }
                }
              >
                {g === null ? t("allGenres") : (t.has(`genres.${g}`) ? t(`genres.${g}`) : (genreLabel[g] ?? g))}
              </button>
            ))}
          </div>
        </div>

        {/* Count bar */}
        <div className="border-t border-[var(--color-border)] px-4 py-1.5 mx-auto max-w-5xl">
          <p className="credits-label">{t("count", { count: filtered.length })}</p>
        </div>
      </div>

      {/* Card grid */}
      <div className="mx-auto max-w-5xl px-4 py-5">
        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="credits-label">{t("empty")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filtered.map((movie) => {
              const displayTitle = getMovieTitle(movie, lang);
              return (
                <Link key={movie.id} href={`/movies/${movie.id}`} className="group block">
                  {/* Poster card */}
                  <div
                    className="relative overflow-hidden rounded-lg border border-[var(--color-border)] transition-all duration-200 group-hover:border-[var(--color-border-accent)]"
                    style={{ aspectRatio: "2/3", background: "var(--color-bg-elevated)" }}
                  >
                    {movie.posterUrl ? (
                      <Image
                        src={movie.posterUrl}
                        alt={displayTitle}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span style={{ fontFamily: "var(--font-dm-serif)", fontSize: "2.5rem", opacity: 0.15, color: "var(--color-text-primary)" }}>
                          {displayTitle[0]}
                        </span>
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

                    {/* Score ring */}
                    {movie.reviewScore != null && (
                      <div className="absolute right-1.5 top-1.5">
                        <ScoreRing score={movie.reviewScore} />
                      </div>
                    )}

                    {/* Bottom info */}
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p
                        className="line-clamp-2 leading-tight"
                        style={{ fontFamily: "var(--font-dm-serif)", fontSize: "0.8rem", color: "var(--color-text-primary)" }}
                      >
                        {displayTitle}
                      </p>
                      <p className="credits-label mt-0.5 opacity-70">{movie.releaseYear}</p>
                    </div>
                  </div>

                  {/* Genre + director below card */}
                  <div className="mt-1.5 px-0.5">
                    <p className="credits-label text-center" style={{ color: "var(--color-accent)", opacity: 0.8 }}>
                      {t.has(`genres.${movie.genrePrimary}`) ? t(`genres.${movie.genrePrimary}`) : (genreLabel[movie.genrePrimary] ?? movie.genrePrimary)}
                    </p>
                    {movie.directors[0] && (
                      <p className="credits-label mt-0.5 truncate text-center opacity-60">
                        {movie.directors[0]}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
