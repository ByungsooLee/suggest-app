"use client";

import Link from "next/link";
import { useLang, resolveField, type LocalizedData } from "@/lib/i18n/lang-context";
import { LangSelector } from "@/components/lang-selector";

type MoodEntry = { label: string; value: number };

type Props = {
  movieId: string;
  fallbackTitle: string;
  fallbackOverview: string | null;
  fallbackDirectors: string[];
  fallbackCast: string[];
  localizedData: LocalizedData | null;
  releaseYear: number;
  runtimeMinutes: number;
  genrePrimary: string;
  genreSecondary: string | null;
  reviewScore: number | null;
  reviewSummary: string | null;
  moodProfile: MoodEntry[];
  similar: { id: string; title: string; releaseYear: number }[];
};

export function MovieI18n({
  fallbackTitle,
  fallbackOverview,
  fallbackDirectors,
  fallbackCast,
  localizedData,
  releaseYear,
  runtimeMinutes,
  genrePrimary,
  genreSecondary,
  reviewScore,
  reviewSummary,
  moodProfile,
  similar,
}: Props) {
  const { lang } = useLang();

  const title = (resolveField(localizedData, lang, "title", fallbackTitle) as string) || fallbackTitle;
  const overview = (resolveField(localizedData, lang, "overview", fallbackOverview) as string) || fallbackOverview;
  const directors = (resolveField(localizedData, lang, "directors", fallbackDirectors) as string[]) || fallbackDirectors;
  const cast = (resolveField(localizedData, lang, "cast", fallbackCast) as string[]) || fallbackCast;

  return (
    <>
      {/* Header with lang selector */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="credits-label mb-2">
            {releaseYear} · {runtimeMinutes}min · {genrePrimary}
            {genreSecondary ? ` · ${genreSecondary}` : ""}
          </p>
          <h1 className="credits-name-lg">{title}</h1>
        </div>
        <LangSelector className="shrink-0 mt-1" />
      </div>

      <div className="credits-divider mb-10" />

      {/* Directors */}
      {directors.length > 0 && (
        <section className="credits-section mb-10">
          <p className="credits-label mb-3">Direction</p>
          {directors.map((d, i) => (
            <Link
              key={i}
              href={`/people/${encodeURIComponent(fallbackDirectors[i] ?? d)}?role=director`}
              className="block"
            >
              <p className="credits-name transition hover:text-[var(--color-accent)]">{d}</p>
            </Link>
          ))}
        </section>
      )}

      {/* Cast */}
      {cast.length > 0 && (
        <section className="credits-section mb-10">
          <p className="credits-label mb-3">Cast</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
            {cast.slice(0, 8).map((name, i) => (
              <Link
                key={i}
                href={`/people/${encodeURIComponent(fallbackCast[i] ?? name)}?role=actor`}
                className="block"
              >
                <p className="credits-name text-sm transition hover:text-[var(--color-accent)]">{name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Overview */}
      {overview && (
        <>
          <div className="credits-divider mb-10" />
          <section className="credits-section mb-10">
            <p className="credits-label mb-4">Synopsis</p>
            <p className="text-body mx-auto max-w-sm leading-relaxed">{overview}</p>
          </section>
        </>
      )}

      {/* Review */}
      {reviewScore != null && (
        <>
          <div className="credits-divider mb-10" />
          <section className="credits-section mb-10">
            <p className="credits-label mb-2">Review</p>
            <p className="credits-name-lg text-[var(--color-accent)]">
              {reviewScore.toFixed(1)}
              <span className="credits-label ml-1">/10</span>
            </p>
            {reviewSummary && (
              <p className="text-body mx-auto mt-3 max-w-sm">{reviewSummary}</p>
            )}
          </section>
        </>
      )}

      {/* Mood Profile */}
      <div className="credits-divider mb-10" />
      <section className="credits-section mb-10">
        <p className="credits-label mb-6">Mood Profile</p>
        <div className="mx-auto max-w-xs space-y-4">
          {moodProfile.map(({ label, value }) => {
            const pct = Math.round(value * 100);
            return (
              <div key={label}>
                <div className="credits-score-bar mb-1">
                  <span className="credits-label w-20 shrink-0 text-right">{label}</span>
                  <div className="credits-score-track">
                    <div className="credits-score-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="credits-label w-8 shrink-0 text-left" style={{ color: "var(--color-accent)" }}>
                    {pct}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Similar Films */}
      {similar.length > 0 && (
        <>
          <div className="credits-divider mb-10" />
          <section className="credits-section mb-10">
            <p className="credits-label mb-6">Similar Films</p>
            <div className="space-y-4">
              {similar.map((s) => (
                <Link
                  key={s.id}
                  href={`/movies/${s.id}`}
                  className="credits-name block text-base transition hover:text-[var(--color-accent)]"
                >
                  {s.title}
                  <span className="ml-2 text-xs text-[var(--color-text-muted)]">{s.releaseYear}</span>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}
