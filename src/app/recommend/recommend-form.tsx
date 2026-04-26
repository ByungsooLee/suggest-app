"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { MoodChip } from "@/components/ui/mood-chip";
import { PopButton } from "@/components/ui/pop-button";
import { PopCard } from "@/components/ui/pop-card";
import { CONTENT_WARNING_TAGS, MOOD_TAGS, WATCH_CONTEXTS, type MoodTag, type WatchContext } from "@/lib/constants/taxonomy";

const STEP_COUNT = 4;

const STEP_LABELS = [
  "今夜は何分？",
  "誰と観る？",
  "避けたいもの",
  "今夜の気分",
] as const;

const WATCH_CONTEXT_LABELS: Record<WatchContext, string> = {
  solo_watch: "ひとりで観る",
  date_friendly: "デートで観る",
  friends_hangout: "友人と観る",
  family_time: "家族で観る",
  late_night_fit: "夜更かしで観る",
};

const MOOD_LABELS: Record<MoodTag, string> = {
  calm: "落ち着きたい",
  emotional: "感情を揺さぶられたい",
  stylish: "映像美を楽しみたい",
  dark: "ダークな雰囲気",
  funny: "笑いたい",
  tense: "緊張感がほしい",
  uplifting: "前向きになりたい",
  melancholic: "余韻に浸りたい",
};

const RUNTIME_PRESETS = [
  { id: "quick", label: "さくっと (90分)", value: 90 },
  { id: "standard", label: "標準 (120分)", value: 120 },
  { id: "long", label: "じっくり (150分)", value: 150 },
] as const;

export function RecommendForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [currentMoods, setCurrentMoods] = useState<MoodTag[]>([]);
  const [runtimeTarget, setRuntimeTarget] = useState(120);
  const [watchingWith, setWatchingWith] = useState<WatchContext>("solo_watch");
  const [excludeContentWarnings, setExcludeContentWarnings] = useState<string[]>([]);
  const [excludeTags, setExcludeTags] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<(typeof RUNTIME_PRESETS)[number]["id"]>("standard");
  const stepProgress = Math.round((step / STEP_COUNT) * 100);

  const desiredRuntimeMin = useMemo(() => Math.max(60, runtimeTarget - 20), [runtimeTarget]);
  const desiredRuntimeMax = useMemo(() => Math.min(240, runtimeTarget + 20), [runtimeTarget]);

  const toggleValue = <T extends string>(arr: T[], value: T, set: (next: T[]) => void) => {
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
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
          preferredGenres: [],
          preferredDirectors: [],
          preferredActors: [],
          minimumReviewScore: undefined,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as { sessionId?: string; message?: string };
      if (!response.ok || !data.sessionId) {
        setState("error");
        setErrorMessage(data.message ?? "推薦作成に失敗しました。");
        return;
      }

      router.push(`/recommend/result/${data.sessionId}`);
      router.refresh();
    } catch (error) {
      setState("error");
      if (error instanceof DOMException && error.name === "AbortError") {
        setErrorMessage("計算に時間がかかっています。しばらくして再試行してください。");
      } else {
        setErrorMessage("通信エラーが発生しました。ネットワーク状態を確認して再試行してください。");
      }
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const goNext = () => {
    setStep((prev) => (prev < 4 ? ((prev + 1) as 1 | 2 | 3 | 4) : prev));
  };

  const goBack = () => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3 | 4) : prev));
  };

  return (
    <form className="mt-6 space-y-6 pb-32" onSubmit={submit}>
      <div className="sticky top-2 z-10 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-overlay)] p-3 backdrop-blur">
        <p className="text-heading">step {step}/4 · {STEP_LABELS[step - 1]}</p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-elevated)]">
          <div className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-300" style={{ width: `${stepProgress}%` }} />
        </div>
      </div>

      {/* Step 1: 尺 */}
      {step === 1 && (
        <PopCard tone="surface" className="space-y-4">
          <h2 className="text-movie-title text-[1.5rem]">今夜は何分くらい観たい？</h2>
          <div className="flex flex-wrap gap-2">
            {RUNTIME_PRESETS.map((preset) => (
              <MoodChip
                key={preset.id}
                label={preset.label}
                selected={selectedPreset === preset.id}
                onClick={() => {
                  setSelectedPreset(preset.id);
                  setRuntimeTarget(preset.value);
                }}
              />
            ))}
          </div>
          <div className="space-y-2">
            <label className="text-label">詳細調整（{runtimeTarget}分）</label>
            <input
              type="range"
              min={60}
              max={240}
              step={5}
              value={runtimeTarget}
              onChange={(event) => setRuntimeTarget(Number(event.target.value))}
              className="w-full accent-[var(--color-accent)]"
            />
            <p className="text-body">検索範囲: {desiredRuntimeMin} 〜 {desiredRuntimeMax} 分</p>
          </div>
          <button type="button" className="text-label hover:text-[var(--color-text-primary)]" onClick={goNext}>
            このまま次へ
          </button>
        </PopCard>
      )}

      {/* Step 2: 文脈（シングル選択・タップ後260ms自動進行） */}
      {step === 2 && (
        <PopCard tone="surface" className="space-y-4">
          <h2 className="text-movie-title text-[1.5rem]">今夜は誰と観る？</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {WATCH_CONTEXTS.map((context) => (
              <MoodChip
                key={context}
                label={WATCH_CONTEXT_LABELS[context]}
                selected={watchingWith === context}
                onClick={() => {
                  setWatchingWith(context);
                  window.setTimeout(() => setStep(3), 260);
                }}
              />
            ))}
          </div>
          <button type="button" className="text-label hover:text-[var(--color-text-primary)]" onClick={goNext}>
            このまま次へ
          </button>
        </PopCard>
      )}

      {/* Step 3: 除外条件 */}
      {step === 3 && (
        <PopCard tone="surface" className="space-y-4">
          <h2 className="text-movie-title text-[1.5rem]">今夜は避けたいものは？</h2>
          <p className="text-body">任意。スキップして次へ進めます。</p>
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
          <div className="space-y-1">
            <label className="text-label">除外タグ（カンマ区切り、任意）</label>
            <input
              value={excludeTags}
              onChange={(event) => setExcludeTags(event.target.value)}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
              placeholder="slow_burn, dark"
            />
          </div>
        </PopCard>
      )}

      {/* Step 4: 気分（任意・おまかせ可） */}
      {step === 4 && (
        <>
          <PopCard tone="highlight" className="space-y-3">
            <h2 className="text-movie-title text-[1.5rem]">今夜の気分は？</h2>
            <p className="text-body">最大3つまで。選ばなくてもおまかせで提案します。</p>
            <div className="flex flex-wrap gap-2">
              {MOOD_TAGS.map((mood) => (
                <MoodChip
                  key={mood}
                  label={MOOD_LABELS[mood]}
                  selected={currentMoods.includes(mood)}
                  onClick={() => {
                    if (!currentMoods.includes(mood) && currentMoods.length >= 3) return;
                    toggleValue(currentMoods, mood, setCurrentMoods);
                  }}
                />
              ))}
            </div>
          </PopCard>

          <PopCard tone="surface" className="space-y-1 text-sm">
            <p className="text-label">選んだ条件</p>
            <p className="text-body">
              尺 {desiredRuntimeMin}〜{desiredRuntimeMax}分 · {WATCH_CONTEXT_LABELS[watchingWith]}
            </p>
            {excludeContentWarnings.length > 0 && (
              <p className="text-body">除外: {excludeContentWarnings.join(", ")}</p>
            )}
            {currentMoods.length > 0 && (
              <p className="text-body">気分: {currentMoods.map((m) => MOOD_LABELS[m]).join(" / ")}</p>
            )}
          </PopCard>
        </>
      )}

      {state === "error" && <p className="text-sm text-rose-500">{errorMessage}</p>}

      <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[var(--color-bg-void)] via-[var(--color-bg-void)] to-transparent px-6 pb-7 pt-6">
        <div className="mx-auto flex w-full max-w-5xl gap-2">
          <PopButton type="button" variant="ghost" onClick={goBack} disabled={step === 1 || state === "loading"}>
            戻る
          </PopButton>
          {step < 4 ? (
            <PopButton type="button" className="flex-1" onClick={goNext} disabled={state === "loading"}>
              次へ
            </PopButton>
          ) : (
            <PopButton type="submit" disabled={state === "loading"} className="flex-1">
              {state === "loading" ? "計算中..." : "今夜の1本を見つける"}
            </PopButton>
          )}
        </div>
      </div>
    </form>
  );
}
