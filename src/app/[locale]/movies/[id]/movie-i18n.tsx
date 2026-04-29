"use client";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PersonChip } from "@/components/person/PersonChip";
import type { PersonChipData } from "@/components/person/types";
import { useMovieTitleLang } from "@/lib/i18n/lang-context";
import { resolveField, type LocalizedData } from "@/lib/i18n/localized-movie";
import { getMovieTitle } from "@/lib/movie-title";
import { LangSelector } from "@/components/lang-selector";

type MoodEntry = { label: string; value: number };

type Props = {
  movieId: string;
  fallbackTitle: string;
  fallbackOverview: string | null;
  fallbackDirectors: string[];
  fallbackCast: string[];
  fallbackCredits: PersonChipData[];
  localizedData: LocalizedData | null;
  releaseYear: number;
  runtimeMinutes: number;
  genrePrimary: string;
  genreSecondary: string | null;
  reviewScore: number | null;
  reviewSummary: string | null;
  moodProfile: MoodEntry[];
  similar: { id: string; title: string; releaseYear: number; localizedTitles?: unknown; localizedData?: LocalizedData | null }[];
};

export function MovieI18n({
  fallbackTitle,
  fallbackOverview,
  fallbackDirectors,
  fallbackCast,
  fallbackCredits,
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
  const locale = useLocale();
  const { lang: movieTitleLang } = useMovieTitleLang();
  const uiLang = locale === "en" || locale === "ko" || locale === "ja" ? locale : "ja";

  const title = getMovieTitle({ title: fallbackTitle, localizedData }, movieTitleLang);
  const overview = (resolveField(localizedData, uiLang, "overview", fallbackOverview) as string) || fallbackOverview;
  const directors = (resolveField(localizedData, uiLang, "directors", fallbackDirectors) as string[]) || fallbackDirectors;
  const cast = (resolveField(localizedData, uiLang, "cast", fallbackCast) as string[]) || fallbackCast;
  const directorCredits = fallbackCredits
    .filter((credit) => credit.role === "director")
    .map((credit, index) => ({ ...credit, displayName: directors[index] ?? credit.name }));
  const castCredits = fallbackCredits
    .filter((credit) => credit.role === "actor")
    .map((credit, index) => ({ ...credit, displayName: cast[index] ?? credit.name }));
  const writerCredits = fallbackCredits.filter((credit) => credit.role === "writer");

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
          <div className="flex flex-wrap justify-center gap-3">
            {directorCredits.map((credit) => (
              <PersonChip key={`dir-${credit.personId ?? credit.name}`} {...credit} />
            ))}
          </div>
        </section>
      )}

      {writerCredits.length > 0 && (
        <section className="credits-section mb-10">
          <p className="credits-label mb-3">Writing</p>
          <div className="flex flex-wrap justify-center gap-3">
            {writerCredits.map((credit) => (
              <PersonChip key={`writer-${credit.personId ?? credit.name}`} {...credit} />
            ))}
          </div>
        </section>
      )}

      {/* Cast */}
      {cast.length > 0 && (
        <section className="credits-section mb-10">
          <p className="credits-label mb-3">Cast</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
            {castCredits.slice(0, 8).map((credit) => (
              <PersonChip
                key={`cast-${credit.personId ?? credit.name}`}
                {...credit}
                compact
              />
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
                  {getMovieTitle(s, movieTitleLang)}
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
