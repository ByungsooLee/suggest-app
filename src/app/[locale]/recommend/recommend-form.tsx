"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useMemo, useState } from "react";

import { MoodChip } from "@/components/ui/mood-chip";
import { PopButton } from "@/components/ui/pop-button";
import { PopCard } from "@/components/ui/pop-card";
import { CONTENT_WARNING_TAGS, MOOD_TAGS, WATCH_CONTEXTS, type MoodTag, type WatchContext } from "@/lib/constants/taxonomy";

const STEP_COUNT = 4;

const RUNTIME_PRESETS = [
  { id: "quick", value: 90 },
  { id: "standard", value: 120 },
  { id: "long", value: 150 },
] as const;

type MbtiContext = {
  types: string[];
  score: number;
  chemistry: string;
  movieGenres: string[];
  decisionHook: string;
  exampleMovies: string[];
  watchingWith: "pair" | "group";
} | null;

export function RecommendForm() {
  const t = useTranslations("recommendForm");
  const commonT = useTranslations("common");
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
  const [mbtiContext, setMbtiContext] = useState<MbtiContext>(null);
  const stepProgress = Math.round((step / STEP_COUNT) * 100);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const from = params.get("from");

    if (from === "mbti") {
      const raw = sessionStorage.getItem("mbtiRecommendContext");
      if (!raw) return;
      try {
        const ctx = JSON.parse(raw) as MbtiContext;
        if (!ctx) return;
        const timer = window.setTimeout(() => {
          setMbtiContext(ctx);
          setWatchingWith(ctx.watchingWith === "group" ? "friends_hangout" : "date_friendly");
          setStep(2);
        }, 0);
        return () => window.clearTimeout(timer);
      } catch { /* ignore */ }
      return;
    }

    if (from === "mood") {
      const mood = sessionStorage.getItem("presetMood");
      sessionStorage.removeItem("presetMood");
      if (mood && ["calm", "emotional", "stylish", "dark", "funny", "tense", "uplifting", "melancholic"].includes(mood)) {
        const timer = window.setTimeout(() => {
          setCurrentMoods([mood as typeof currentMoods[number]]);
          setStep(2);
        }, 0);
        return () => window.clearTimeout(timer);
      }
    }
  }, []);

  const desiredRuntimeMin = useMemo(() => Math.max(60, runtimeTarget - 20), [runtimeTarget]);
  const desiredRuntimeMax = useMemo(() => Math.min(240, runtimeTarget + 20), [runtimeTarget]);
  const stepKeys = ["runtime", "withWhom", "avoid", "mood"] as const;
  const watchContextLabels: Record<WatchContext, string> = {
    solo_watch: t("watchContexts.solo_watch"),
    date_friendly: t("watchContexts.date_friendly"),
    friends_hangout: t("watchContexts.friends_hangout"),
    family_time: t("watchContexts.family_time"),
    late_night_fit: t("watchContexts.late_night_fit"),
  };
  const moodLabels: Record<MoodTag, string> = {
    calm: t("moods.calm"),
    emotional: t("moods.emotional"),
    stylish: t("moods.stylish"),
    dark: t("moods.dark"),
    funny: t("moods.funny"),
    tense: t("moods.tense"),
    uplifting: t("moods.uplifting"),
    melancholic: t("moods.melancholic"),
  };

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
          mbtiContext: mbtiContext ?? undefined,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as { sessionId?: string; message?: string };
      if (!response.ok || !data.sessionId) {
        setState("error");
        setErrorMessage(data.message ?? t("errorCreate"));
        return;
      }

      router.push(`/recommend/result/${data.sessionId}`);
      router.refresh();
    } catch (error) {
      setState("error");
      if (error instanceof DOMException && error.name === "AbortError") {
        setErrorMessage(t("errorTimeout"));
      } else {
        setErrorMessage(t("errorNetwork"));
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
    <form className="mt-6 space-y-6 pb-52" onSubmit={submit}>
      <div className="sticky top-2 z-10 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-overlay)] p-3 backdrop-blur">
        <p className="text-heading">{t("step", { current: step })} · {t(`steps.${stepKeys[step - 1]}`)}</p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-elevated)]">
          <div className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-300" style={{ width: `${stepProgress}%` }} />
        </div>
      </div>

      {/* Step 1: 尺 */}
      {step === 1 && (
        <PopCard tone="surface" className="space-y-4">
          <h2 className="text-movie-title text-[1.5rem]">{t("runtimeTitle")}</h2>
          <div className="flex flex-wrap gap-2">
            {RUNTIME_PRESETS.map((preset) => (
              <MoodChip
                key={preset.id}
                label={t(`runtimePresets.${preset.id}`)}
                selected={selectedPreset === preset.id}
                onClick={() => {
                  setSelectedPreset(preset.id);
                  setRuntimeTarget(preset.value);
                }}
              />
            ))}
          </div>
          <div className="space-y-2">
            <label className="text-label">{t("runtimeAdjust", { minutes: runtimeTarget })}</label>
            <input
              type="range"
              min={60}
              max={240}
              step={5}
              value={runtimeTarget}
              onChange={(event) => setRuntimeTarget(Number(event.target.value))}
              className="w-full accent-[var(--color-accent)]"
            />
            <p className="text-body">{t("runtimeRange", { min: desiredRuntimeMin, max: desiredRuntimeMax })}</p>
          </div>
          <button type="button" className="text-label hover:text-[var(--color-text-primary)]" onClick={goNext}>
            {t("keepGoing")}
          </button>
        </PopCard>
      )}

      {/* Step 2: 文脈（シングル選択・タップ後260ms自動進行） */}
      {step === 2 && (
        <PopCard tone="surface" className="space-y-4">
          <h2 className="text-movie-title text-[1.5rem]">{t("withWhomTitle")}</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {WATCH_CONTEXTS.map((context) => (
              <MoodChip
                key={context}
                label={watchContextLabels[context]}
                selected={watchingWith === context}
                onClick={() => {
                  setWatchingWith(context);
                  window.setTimeout(() => setStep(3), 260);
                }}
              />
            ))}
          </div>
          <button type="button" className="text-label hover:text-[var(--color-text-primary)]" onClick={goNext}>
            {t("keepGoing")}
          </button>
        </PopCard>
      )}

      {/* Step 3: 除外条件 */}
      {step === 3 && (
        <PopCard tone="surface" className="space-y-4">
          <h2 className="text-movie-title text-[1.5rem]">{t("avoidTitle")}</h2>
          <p className="text-body">{t("avoidHelp")}</p>
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
            <label className="text-label">{t("excludeTagsLabel")}</label>
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
            <h2 className="text-movie-title text-[1.5rem]">{t("moodTitle")}</h2>
            <p className="text-body">{t("moodHelp")}</p>
            <div className="flex flex-wrap gap-2">
              {MOOD_TAGS.map((mood) => (
                <MoodChip
                  key={mood}
                  label={moodLabels[mood]}
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
            <p className="text-label">{t("summaryTitle")}</p>
            <p className="text-body">
              {t("summaryRuntime", { min: desiredRuntimeMin, max: desiredRuntimeMax, context: watchContextLabels[watchingWith] })}
            </p>
            {excludeContentWarnings.length > 0 && (
              <p className="text-body">{t("summaryExclude", { items: excludeContentWarnings.join(", ") })}</p>
            )}
            {currentMoods.length > 0 && (
              <p className="text-body">{t("summaryMood", { items: currentMoods.map((m) => moodLabels[m]).join(" / ") })}</p>
            )}
          </PopCard>
        </>
      )}

      {state === "error" && <p className="text-sm text-rose-500">{errorMessage}</p>}

      <div
        className="fixed inset-x-0 z-40 bg-gradient-to-t from-[var(--color-bg-void)] via-[var(--color-bg-void)] to-transparent px-6 pb-4 pt-6"
        style={{ bottom: "calc(72px + env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex w-full max-w-5xl gap-2">
          <PopButton type="button" variant="ghost" onClick={goBack} disabled={step === 1 || state === "loading"}>
            {commonT("back")}
          </PopButton>
          {step < 4 ? (
            <PopButton type="button" className="flex-1" onClick={goNext} disabled={state === "loading"}>
              {commonT("next")}
            </PopButton>
          ) : (
            <PopButton type="submit" disabled={state === "loading"} className="flex-1">
              {state === "loading" ? t("submitting") : t("submit")}
            </PopButton>
          )}
        </div>
      </div>
    </form>
  );
}
