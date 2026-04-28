"use client";

import { useEffect, useState } from "react";

import { MoodChip } from "@/components/ui/mood-chip";
import { PersonPreviewTrigger } from "@/components/person-preview-trigger";
import { PopButton } from "@/components/ui/pop-button";
import { PopCard } from "@/components/ui/pop-card";
import { MOVIE_GENRES } from "@/lib/constants/taxonomy";

type DiscoveryMode = "focused" | "balanced" | "wide";

type PreferencesResponse = {
  preferences: {
    favoriteGenres: string[];
    excludedGenres: string[];
    preferredDirectors: string[];
    preferredActors: string[];
    discoveryMode: DiscoveryMode;
  };
};

type SuggestionItem = {
  name: string;
  count: number;
  role: "director" | "actor";
  encodedName: string;
};

type SuggestionsResponse = {
  genres: string[];
  directors: SuggestionItem[];
  actors: SuggestionItem[];
  fallbackUsed: boolean;
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

export function GenrePreferencesForm() {
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>([]);
  const [excludedGenres, setExcludedGenres] = useState<string[]>([]);
  const [preferredDirectors, setPreferredDirectors] = useState("");
  const [preferredActors, setPreferredActors] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestionsResponse | null>(null);
  const [suggestionState, setSuggestionState] = useState<"idle" | "loading" | "error">("idle");
  const [discoveryMode, setDiscoveryMode] = useState<DiscoveryMode>("balanced");
  const [state, setState] = useState<"loading" | "idle" | "saving" | "done" | "error">("loading");
  const [message, setMessage] = useState("");
  const selectedDirectorSet = new Set(parseCsv(preferredDirectors));
  const selectedActorSet = new Set(parseCsv(preferredActors));

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/mypage/preferences", { cache: "no-store" });
        if (!response.ok) throw new Error("load failed");
        const data = (await response.json()) as PreferencesResponse;
        setFavoriteGenres(data.preferences.favoriteGenres);
        setExcludedGenres(data.preferences.excludedGenres);
        setPreferredDirectors(parseCsv(data.preferences.preferredDirectors.join(", ")).join(", "));
        setPreferredActors(parseCsv(data.preferences.preferredActors.join(", ")).join(", "));
        setDiscoveryMode(data.preferences.discoveryMode);
        setState("idle");
      } catch {
        setState("error");
        setMessage("設定の読み込みに失敗しました。");
      }
    };
    void load();
  }, []);

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
      const response = await fetch("/api/mypage/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          favoriteGenres,
          excludedGenres,
          preferredDirectors: parseCsv(preferredDirectors).slice(0, 20),
          preferredActors: parseCsv(preferredActors).slice(0, 20),
          discoveryMode,
        }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        throw new Error(data.message ?? "保存に失敗しました。");
      }
      setState("done");
      setMessage("保存しました。次回推薦から反映されます。");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "保存に失敗しました。");
    }
  };

  if (state === "loading") {
    return (
      <PopCard tone="muted">
        <p className="text-sm text-[var(--color-text-secondary)]">設定を読み込み中...</p>
      </PopCard>
    );
  }

  return (
    <div className="space-y-4">
      <PopCard tone="surface" className="space-y-3">
        <h2 className="text-sm font-[500]">好きなジャンル（優先したい）</h2>
        <div className="flex flex-wrap gap-2">
          {MOVIE_GENRES.map((genre) => (
            <MoodChip
              key={`fav-${genre}`}
              label={genre}
              selected={favoriteGenres.includes(genre)}
              onClick={() => toggleGenre(genre, "favorite")}
            />
          ))}
        </div>
      </PopCard>

      <PopCard tone="muted" className="space-y-3">
        <h2 className="text-sm font-[500]">避けたいジャンル</h2>
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
        <h2 className="text-sm font-[500]">提案の広がり</h2>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "focused", label: "絞る" },
            { id: "balanced", label: "バランス" },
            { id: "wide", label: "広げる" },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setDiscoveryMode(mode.id as DiscoveryMode)}
              className={`rounded-[var(--radius-md)] px-3 py-2 text-xs font-[500] transition ${
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

      <PopCard tone="surface" className="space-y-2">
        <h2 className="text-sm font-[500]">推し監督（カンマ区切り）</h2>
        <div className="flex flex-wrap gap-2">
          {suggestionState === "loading" && <p className="text-xs text-[var(--color-text-secondary)]">候補を読み込み中...</p>}
          {suggestionState === "error" && <p className="text-xs text-[var(--color-streaming)]">候補の取得に失敗しました。</p>}
          {suggestionState === "idle" && suggestions?.directors.length === 0 && (
            <p className="text-xs text-[var(--color-text-secondary)]">このジャンルでは監督候補がまだありません。</p>
          )}
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
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
          placeholder="Christopher Nolan, Greta Gerwig"
        />
      </PopCard>

      <PopCard tone="surface" className="space-y-2">
        <h2 className="text-sm font-[500]">推し俳優（カンマ区切り）</h2>
        <div className="flex flex-wrap gap-2">
          {suggestionState === "loading" && <p className="text-xs text-[var(--color-text-secondary)]">候補を読み込み中...</p>}
          {suggestionState === "error" && <p className="text-xs text-[var(--color-streaming)]">候補の取得に失敗しました。</p>}
          {suggestionState === "idle" && suggestions?.actors.length === 0 && (
            <p className="text-xs text-[var(--color-text-secondary)]">このジャンルでは俳優候補がまだありません。</p>
          )}
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
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
          placeholder="Ryan Gosling, Emma Stone"
        />
      </PopCard>

      {message && (
        <p className={`text-sm ${state === "error" ? "text-[var(--color-streaming)]" : "text-[var(--color-match-high)]"}`}>
          {message}
        </p>
      )}
      {suggestions?.fallbackUsed && (
        <p className="text-xs text-[var(--color-text-secondary)]">選択ジャンルの候補が少ないため、全体データから候補を提案しています。</p>
      )}

      <PopButton type="button" onClick={save} disabled={state === "saving"} className="w-full">
        {state === "saving" ? "保存中..." : "ジャンル設定を保存"}
      </PopButton>
    </div>
  );
}
