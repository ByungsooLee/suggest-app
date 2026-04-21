"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { MoodChip } from "@/components/ui/mood-chip";
import { PersonPreviewTrigger } from "@/components/person-preview-trigger";
import { PopButton } from "@/components/ui/pop-button";
import { PopCard } from "@/components/ui/pop-card";
import { CONTENT_WARNING_TAGS, MOOD_TAGS, MOVIE_GENRES, WATCH_CONTEXTS } from "@/lib/constants/taxonomy";

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

type MyPagePreferencesResponse = {
  preferences: {
    favoriteGenres: string[];
    preferredDirectors: string[];
    preferredActors: string[];
  };
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
  if (list.includes(name)) return setCsv(list.filter((item) => item !== name));
  return setCsv([...list, name]);
};

export function RecommendForm() {
  const router = useRouter();
  const [currentMoods, setCurrentMoods] = useState<string[]>(["calm"]);
  const [desiredRuntimeMin, setDesiredRuntimeMin] = useState(90);
  const [desiredRuntimeMax, setDesiredRuntimeMax] = useState(130);
  const [watchingWith, setWatchingWith] = useState<(typeof WATCH_CONTEXTS)[number]>("solo_watch");
  const [excludeContentWarnings, setExcludeContentWarnings] = useState<string[]>([]);
  const [excludeTags, setExcludeTags] = useState("");
  const [preferredDirectors, setPreferredDirectors] = useState("");
  const [preferredActors, setPreferredActors] = useState("");
  const [suggestionGenres, setSuggestionGenres] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionsResponse | null>(null);
  const [suggestionState, setSuggestionState] = useState<"idle" | "loading" | "error">("idle");
  const [minimumReviewScore, setMinimumReviewScore] = useState<number>(0);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const selectedDirectorSet = new Set(parseCsv(preferredDirectors));
  const selectedActorSet = new Set(parseCsv(preferredActors));

  const toggleValue = (arr: string[], value: string, set: (next: string[]) => void) => {
    if (arr.includes(value)) {
      set(arr.filter((v) => v !== value));
      return;
    }
    set([...arr, value]);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState("loading");
    setErrorMessage("");

    const response = await fetch("/api/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentMoods,
        desiredRuntimeMin,
        desiredRuntimeMax,
        watchingWith,
        excludeContentWarnings,
        excludeTags: excludeTags
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        preferredDirectors: parseCsv(preferredDirectors).slice(0, 10),
        preferredActors: parseCsv(preferredActors).slice(0, 10),
        minimumReviewScore: minimumReviewScore > 0 ? minimumReviewScore : undefined,
      }),
    });

    const data = (await response.json()) as { sessionId?: string; message?: string };
    if (!response.ok || !data.sessionId) {
      setState("error");
      setErrorMessage(data.message ?? "推薦作成に失敗しました。");
      return;
    }

    router.push(`/recommend/result/${data.sessionId}`);
    router.refresh();
  };

  useEffect(() => {
    const loadMyPagePreferences = async () => {
      try {
        const response = await fetch("/api/mypage/preferences", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as MyPagePreferencesResponse;
        setSuggestionGenres(data.preferences.favoriteGenres ?? []);
        if (data.preferences.preferredDirectors?.length) {
          setPreferredDirectors(parseCsv(data.preferences.preferredDirectors.join(", ")).join(", "));
        }
        if (data.preferences.preferredActors?.length) {
          setPreferredActors(parseCsv(data.preferences.preferredActors.join(", ")).join(", "));
        }
      } catch {
        // no-op: recommendation screen still works with manual input
      }
    };
    void loadMyPagePreferences();
  }, []);

  useEffect(() => {
    const loadSuggestions = async () => {
      setSuggestionState("loading");
      try {
        const query = suggestionGenres.join(",");
        const response = await fetch(`/api/movies/suggestions?genres=${encodeURIComponent(query)}&limit=12`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("suggestions failed");
        const data = (await response.json()) as SuggestionsResponse;
        setSuggestions(data);
        setSuggestionState("idle");
      } catch {
        setSuggestionState("error");
      }
    };
    void loadSuggestions();
  }, [suggestionGenres]);

  return (
    <form className="mt-6 space-y-6" onSubmit={submit}>
      <PopCard tone="highlight" className="space-y-2">
        <h2 className="text-sm font-semibold">今のムード (1〜3)</h2>
        <div className="flex flex-wrap gap-2">
          {MOOD_TAGS.map((mood) => (
            <MoodChip key={mood} label={mood} selected={currentMoods.includes(mood)} onClick={() => toggleValue(currentMoods, mood, setCurrentMoods)} />
          ))}
        </div>
      </PopCard>

      <PopCard tone="surface" className="grid grid-cols-2 gap-3">
        <label className="space-y-1 text-sm">
          <span>最小時間</span>
          <input
            type="number"
            min={60}
            max={240}
            value={desiredRuntimeMin}
            onChange={(event) => setDesiredRuntimeMin(Number(event.target.value))}
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span>最大時間</span>
          <input
            type="number"
            min={60}
            max={240}
            value={desiredRuntimeMax}
            onChange={(event) => setDesiredRuntimeMax(Number(event.target.value))}
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
      </PopCard>

      <PopCard tone="surface" className="space-y-2">
        <h2 className="text-sm font-semibold">誰と観るか</h2>
        <select
          value={watchingWith}
          onChange={(event) => setWatchingWith(event.target.value as (typeof WATCH_CONTEXTS)[number])}
          className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          {WATCH_CONTEXTS.map((context) => (
            <option key={context} value={context}>
              {context}
            </option>
          ))}
        </select>
      </PopCard>

      <PopCard tone="muted" className="space-y-2">
        <h2 className="text-sm font-semibold">除外したいwarning</h2>
        <div className="flex flex-wrap gap-2">
          {CONTENT_WARNING_TAGS.map((warning) => (
            <MoodChip
              key={warning}
              label={warning}
              selected={excludeContentWarnings.includes(warning)}
              onClick={() => toggleValue(excludeContentWarnings, warning, setExcludeContentWarnings)}
            />
          ))}
        </div>
      </PopCard>

      <PopCard tone="muted" className="space-y-1">
        <label className="text-sm font-semibold">除外タグ (カンマ区切り)</label>
        <input
          value={excludeTags}
          onChange={(event) => setExcludeTags(event.target.value)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          placeholder="slow_burn, dark"
        />
      </PopCard>

      <PopCard tone="surface" className="space-y-2">
        <label className="text-sm font-semibold">監督で絞る (カンマ区切り)</label>
        <div className="flex flex-wrap gap-2">
          {suggestionState === "loading" && <p className="text-xs text-zinc-500">候補を読み込み中...</p>}
          {suggestionState === "error" && <p className="text-xs text-rose-600">候補の取得に失敗しました。</p>}
          {suggestionState === "idle" && suggestions?.directors.length === 0 && (
            <p className="text-xs text-zinc-500">このジャンルでは監督候補がまだありません。</p>
          )}
          {suggestions?.directors.map((director) => (
            <PersonPreviewTrigger
              key={`recommend-director-${director.name}`}
              name={director.name}
              count={director.count}
              role={director.role}
              selected={selectedDirectorSet.has(director.name)}
              onSelect={() => setPreferredDirectors((prev) => toggleName(prev, director.name))}
            />
          ))}
        </div>
        <input
          value={preferredDirectors}
          onChange={(event) => setPreferredDirectors(event.target.value)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          placeholder="Christopher Nolan, Denis Villeneuve"
        />
      </PopCard>

      <PopCard tone="surface" className="space-y-2">
        <label className="text-sm font-semibold">俳優で絞る (カンマ区切り)</label>
        <div className="flex flex-wrap gap-2">
          {suggestionState === "loading" && <p className="text-xs text-zinc-500">候補を読み込み中...</p>}
          {suggestionState === "error" && <p className="text-xs text-rose-600">候補の取得に失敗しました。</p>}
          {suggestionState === "idle" && suggestions?.actors.length === 0 && (
            <p className="text-xs text-zinc-500">このジャンルでは俳優候補がまだありません。</p>
          )}
          {suggestions?.actors.map((actor) => (
            <PersonPreviewTrigger
              key={`recommend-actor-${actor.name}`}
              name={actor.name}
              count={actor.count}
              role={actor.role}
              selected={selectedActorSet.has(actor.name)}
              onSelect={() => setPreferredActors((prev) => toggleName(prev, actor.name))}
            />
          ))}
        </div>
        <input
          value={preferredActors}
          onChange={(event) => setPreferredActors(event.target.value)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          placeholder="Ryan Gosling, Amy Adams"
        />
      </PopCard>

      <PopCard tone="surface" className="space-y-2">
        <label className="text-sm font-semibold">最低レビュー点 (0-10)</label>
        <input
          type="number"
          min={0}
          max={10}
          step={0.1}
          value={minimumReviewScore}
          onChange={(event) => setMinimumReviewScore(Number(event.target.value))}
          className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </PopCard>

      <PopCard tone="muted" className="space-y-2">
        <p className="text-sm font-semibold">候補提案に使うジャンル</p>
        <div className="flex flex-wrap gap-2">
          {MOVIE_GENRES.map((genre) => (
            <MoodChip
              key={`suggestion-genre-${genre}`}
              label={genre}
              selected={suggestionGenres.includes(genre)}
              onClick={() =>
                setSuggestionGenres((prev) =>
                  prev.includes(genre) ? prev.filter((item) => item !== genre) : [...prev, genre],
                )
              }
            />
          ))}
        </div>
        {suggestions?.fallbackUsed && (
          <p className="text-xs text-zinc-500">対象ジャンルの候補が少ないため、全体データから提案しています。</p>
        )}
      </PopCard>

      <PopCard tone="surface" className="space-y-1 text-sm">
        <p className="font-semibold text-zinc-700 dark:text-zinc-200">ライブプレビュー</p>
        <p className="text-zinc-600 dark:text-zinc-300">
          mood {currentMoods.length}件 / 尺 {desiredRuntimeMin}-{desiredRuntimeMax}分 / with {watchingWith}
        </p>
        <p className="text-zinc-600 dark:text-zinc-300">
          監督 {preferredDirectors || "なし"} / 俳優 {preferredActors || "なし"} / 最低レビュー {minimumReviewScore > 0 ? minimumReviewScore : "指定なし"}
        </p>
      </PopCard>

      {state === "error" && <p className="text-sm text-rose-600">{errorMessage}</p>}
      <PopButton type="submit" disabled={state === "loading"} className="w-full">
        {state === "loading" ? "計算中..." : "今夜の3本を提案"}
      </PopButton>
    </form>
  );
}
