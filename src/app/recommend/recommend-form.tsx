"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { MoodChip } from "@/components/ui/mood-chip";
import { PopButton } from "@/components/ui/pop-button";
import { PopCard } from "@/components/ui/pop-card";
import { CONTENT_WARNING_TAGS, MOOD_TAGS, WATCH_CONTEXTS } from "@/lib/constants/taxonomy";

export function RecommendForm() {
  const router = useRouter();
  const [currentMoods, setCurrentMoods] = useState<string[]>(["calm"]);
  const [desiredRuntimeMin, setDesiredRuntimeMin] = useState(90);
  const [desiredRuntimeMax, setDesiredRuntimeMax] = useState(130);
  const [watchingWith, setWatchingWith] = useState<(typeof WATCH_CONTEXTS)[number]>("solo_watch");
  const [excludeContentWarnings, setExcludeContentWarnings] = useState<string[]>([]);
  const [excludeTags, setExcludeTags] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

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

      <PopCard tone="surface" className="space-y-1 text-sm">
        <p className="font-semibold text-zinc-700 dark:text-zinc-200">ライブプレビュー</p>
        <p className="text-zinc-600 dark:text-zinc-300">
          mood {currentMoods.length}件 / 尺 {desiredRuntimeMin}-{desiredRuntimeMax}分 / with {watchingWith}
        </p>
      </PopCard>

      {state === "error" && <p className="text-sm text-rose-600">{errorMessage}</p>}
      <PopButton type="submit" disabled={state === "loading"} className="w-full">
        {state === "loading" ? "計算中..." : "今夜の3本を提案"}
      </PopButton>
    </form>
  );
}
