"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { PersonPreviewTrigger } from "@/components/person-preview-trigger";
import { MoodChip } from "@/components/ui/mood-chip";
import { PopButton } from "@/components/ui/pop-button";
import { PopCard } from "@/components/ui/pop-card";
import { MOVIE_GENRES } from "@/lib/constants/taxonomy";

import { type Preferences, type SuggestionsResponse } from "./types";

type RecommendationPreferencesSectionProps = {
  initialPreferences: Preferences | null;
  onSaved: (preferences: Preferences) => void;
};

const parseCsv = (value: string) =>
  Array.from(
    new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .filter((item) => !item.toLowerCase().startsWith("unknown ")),
    ),
  );

const setCsv = (values: string[]) => values.join(", ");

const toggleName = (source: string, name: string) => {
  const list = parseCsv(source);
  if (list.includes(name)) {
    return setCsv(list.filter((item) => item !== name));
  }
  return setCsv([...list, name]);
};

export function RecommendationPreferencesSection({ initialPreferences, onSaved }: RecommendationPreferencesSectionProps) {
  const t = useTranslations("mypage.preferences");
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>(initialPreferences?.favoriteGenres ?? []);
  const [excludedGenres, setExcludedGenres] = useState<string[]>(initialPreferences?.excludedGenres ?? []);
  const [preferredDirectors, setPreferredDirectors] = useState(setCsv(initialPreferences?.preferredDirectors ?? []));
  const [preferredActors, setPreferredActors] = useState(setCsv(initialPreferences?.preferredActors ?? []));
  const [suggestions, setSuggestions] = useState<SuggestionsResponse | null>(null);
  const [suggestionState, setSuggestionState] = useState<"idle" | "loading" | "error">("idle");
  const [discoveryMode, setDiscoveryMode] = useState<Preferences["discoveryMode"]>(initialPreferences?.discoveryMode ?? "balanced");
  const [useFavoritesInRecommendations, setUseFavoritesInRecommendations] = useState(
    initialPreferences?.useFavoritesInRecommendations ?? true,
  );
  const [influenceStrength, setInfluenceStrength] = useState<Preferences["influenceStrength"]>(
    initialPreferences?.influenceStrength ?? "balanced",
  );
  const [recommendationStyleMode, setRecommendationStyleMode] = useState<Preferences["recommendationStyleMode"]>(
    initialPreferences?.recommendationStyleMode ?? "balanced",
  );
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const selectedDirectorSet = new Set(parseCsv(preferredDirectors));
  const selectedActorSet = new Set(parseCsv(preferredActors));

  useEffect(() => {
    const loadSuggestions = async () => {
      setSuggestionState("loading");
      try {
        const query = favoriteGenres.join(",");
        const response = await fetch(`/api/movies/suggestions?genres=${encodeURIComponent(query)}&limit=12`, { cache: "no-store" });
        if (!response.ok) throw new Error("suggestions failed");
        const data = (await response.json()) as SuggestionsResponse;
        setSuggestions(data);
        setSuggestionState("idle");
      } catch {
        setSuggestionState("error");
      }
    };
    void loadSuggestions();
  }, [favoriteGenres]);

  const toggleGenre = (genre: string, bucket: "favorite" | "excluded") => {
    if (bucket === "favorite") {
      setFavoriteGenres((prev) => (prev.includes(genre) ? prev.filter((item) => item !== genre) : [...prev, genre]));
      setExcludedGenres((prev) => prev.filter((item) => item !== genre));
      return;
    }
    setExcludedGenres((prev) => (prev.includes(genre) ? prev.filter((item) => item !== genre) : [...prev, genre]));
    setFavoriteGenres((prev) => prev.filter((item) => item !== genre));
  };

  const save = async () => {
    setState("saving");
    setMessage("");
    try {
      const payload: Preferences = {
        favoriteGenres,
        excludedGenres,
        preferredDirectors: parseCsv(preferredDirectors).slice(0, 20),
        preferredActors: parseCsv(preferredActors).slice(0, 20),
        discoveryMode,
        useFavoritesInRecommendations,
        influenceStrength,
        recommendationStyleMode,
      };
      const response = await fetch("/api/me/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        throw new Error(data.message ?? t("saveError"));
      }
      onSaved(payload);
      setState("done");
      setMessage(t("saved"));
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : t("saveError"));
    }
  };

  return (
    <div className="space-y-4">
      <PopCard tone="surface" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-movie-title text-[1.35rem]">{t("title")}</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">{t("description")}</p>
          </div>
          <button
            type="button"
            onClick={() => setUseFavoritesInRecommendations((prev) => !prev)}
            className={`rounded-full border px-3 py-1 text-xs font-[500] ${
              useFavoritesInRecommendations
                ? "border-[var(--color-border-accent)] bg-[var(--color-accent-dim)] text-[var(--color-accent)]"
                : "border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]"
            }`}
          >
            {t("useFavorites")}: {useFavoritesInRecommendations ? "ON" : "OFF"}
          </button>
        </div>
      </PopCard>

      <PopCard tone="surface" className="space-y-3">
        <h3 className="text-sm font-[500]">{t("favoriteGenresTitle")}</h3>
        <div className="flex flex-wrap gap-2">
          {MOVIE_GENRES.map((genre) => (
            <MoodChip key={`fav-${genre}`} label={genre} selected={favoriteGenres.includes(genre)} onClick={() => toggleGenre(genre, "favorite")} />
          ))}
        </div>
      </PopCard>

      <PopCard tone="muted" className="space-y-3">
        <h3 className="text-sm font-[500]">{t("excludedGenresTitle")}</h3>
        <div className="flex flex-wrap gap-2">
          {MOVIE_GENRES.map((genre) => (
            <MoodChip
              key={`exclude-${genre}`}
              label={genre}
              selected={excludedGenres.includes(genre)}
              onClick={() => toggleGenre(genre, "excluded")}
            />
          ))}
        </div>
      </PopCard>

      <PopCard tone="highlight" className="space-y-3">
        <h3 className="text-sm font-[500]">{t("discoveryTitle")}</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "focused", label: t("discoveryFocused") },
            { id: "balanced", label: t("discoveryBalanced") },
            { id: "wide", label: t("discoveryWide") },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setDiscoveryMode(mode.id as Preferences["discoveryMode"])}
              className={`rounded-[var(--radius-md)] px-3 py-2 text-xs font-[500] ${
                discoveryMode === mode.id
                  ? "border border-[var(--color-border-accent)] bg-[var(--color-accent-dim)] text-[var(--color-accent)]"
                  : "border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </PopCard>

      <PopCard tone="surface" className="space-y-3">
        <h3 className="text-sm font-[500]">{t("influenceTitle")}</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "light", label: t("influenceLight") },
            { id: "balanced", label: t("influenceBalanced") },
            { id: "strong", label: t("influenceStrong") },
          ].map((strength) => (
            <button
              key={strength.id}
              type="button"
              onClick={() => setInfluenceStrength(strength.id as Preferences["influenceStrength"])}
              className={`rounded-[var(--radius-md)] px-3 py-2 text-xs font-[500] ${
                influenceStrength === strength.id
                  ? "border border-[var(--color-border-accent)] bg-[var(--color-accent-dim)] text-[var(--color-accent)]"
                  : "border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]"
              }`}
            >
              {strength.label}
            </button>
          ))}
        </div>
      </PopCard>

      <PopCard tone="surface" className="space-y-3">
        <h3 className="text-sm font-[500]">{t("styleTitle")}</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "safe", label: t("styleSafe") },
            { id: "balanced", label: t("styleBalanced") },
            { id: "discovery_focused", label: t("styleDiscovery") },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setRecommendationStyleMode(mode.id as Preferences["recommendationStyleMode"])}
              className={`rounded-[var(--radius-md)] px-3 py-2 text-xs font-[500] ${
                recommendationStyleMode === mode.id
                  ? "border border-[var(--color-border-accent)] bg-[var(--color-accent-dim)] text-[var(--color-accent)]"
                  : "border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </PopCard>

      <PopCard tone="surface" className="space-y-2">
        <h3 className="text-sm font-[500]">{t("directorLabel")}</h3>
        <div className="flex flex-wrap gap-2">
          {suggestionState === "loading" && <p className="text-xs text-[var(--color-text-secondary)]">{t("suggestionsLoading")}</p>}
          {suggestionState === "error" && <p className="text-xs text-rose-500">{t("suggestionsError")}</p>}
          {suggestions?.directors.map((director) => {
            const selected = selectedDirectorSet.has(director.name);
            return (
              <PersonPreviewTrigger
                key={`director-${director.name}`}
                name={director.name}
                count={director.count}
                role={director.role}
                selected={selected}
                onSelect={() => setPreferredDirectors((prev) => toggleName(prev, director.name))}
              />
            );
          })}
        </div>
        <input
          value={preferredDirectors}
          onChange={(event) => setPreferredDirectors(event.target.value)}
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm"
          placeholder="Christopher Nolan, Greta Gerwig"
        />
      </PopCard>

      <PopCard tone="surface" className="space-y-2">
        <h3 className="text-sm font-[500]">{t("actorLabel")}</h3>
        <div className="flex flex-wrap gap-2">
          {suggestionState === "loading" && <p className="text-xs text-[var(--color-text-secondary)]">{t("suggestionsLoading")}</p>}
          {suggestionState === "error" && <p className="text-xs text-rose-500">{t("suggestionsError")}</p>}
          {suggestions?.actors.map((actor) => {
            const selected = selectedActorSet.has(actor.name);
            return (
              <PersonPreviewTrigger
                key={`actor-${actor.name}`}
                name={actor.name}
                count={actor.count}
                role={actor.role}
                selected={selected}
                onSelect={() => setPreferredActors((prev) => toggleName(prev, actor.name))}
              />
            );
          })}
        </div>
        <input
          value={preferredActors}
          onChange={(event) => setPreferredActors(event.target.value)}
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm"
          placeholder="Ryan Gosling, Emma Stone"
        />
      </PopCard>

      {suggestions?.fallbackUsed ? (
        <p className="text-xs text-[var(--color-text-secondary)]">{t("fallback")}</p>
      ) : null}
      {message ? <p className={`text-sm ${state === "error" ? "text-rose-500" : "text-[var(--color-match-high)]"}`}>{message}</p> : null}
      <PopButton onClick={save} disabled={state === "saving"} className="w-full">
        {state === "saving" ? t("saving") : t("save")}
      </PopButton>
    </div>
  );
}
