"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { PopButton } from "@/components/ui/pop-button";
import { PopCard } from "@/components/ui/pop-card";
import { MoodChip } from "@/components/ui/mood-chip";
import { MBTI_TYPES } from "@/lib/constants/taxonomy";
import { USER_MOODS } from "@/lib/onboarding/mood-map";
import { type OnboardingReactionType } from "@/lib/onboarding/onboarding-reaction";

type SwipeCandidate = {
  movieId: string;
  title: string;
  releaseYear: number | null;
  posterUrl: string;
  overview: string | null;
  genrePrimary: string | null;
  genreSecondary: string | null;
};

type OnboardingReaction = {
  movieId: string;
  reactionType: OnboardingReactionType;
};

const REACTION_LABELS: Record<OnboardingReactionType, string> = {
  not_for_me: "興味なし",
  dont_know: "わからない",
  liked: "好き",
};

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mbtiType, setMbtiType] = useState<string>("");
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [candidates, setCandidates] = useState<SwipeCandidate[]>([]);
  const [reactions, setReactions] = useState<Record<string, OnboardingReactionType>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [candidateError, setCandidateError] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const progress = Math.round((step / 3) * 100);
  const currentMovie = candidates[activeIndex] ?? null;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadingCandidates(true);
      setCandidateError("");
      const response = await fetch("/api/onboarding/swipe-candidates", { cache: "no-store" });
      if (response.status === 401) {
        if (!cancelled) {
          setCandidateError("セッションが切れています。再ログインしてください。");
          setLoadingCandidates(false);
          router.push("/login?error=session_stale");
        }
        return;
      }
      if (!response.ok) {
        if (!cancelled) {
          setCandidateError("映画候補の読み込みに失敗しました。時間をおいて再試行してください。");
          setLoadingCandidates(false);
        }
        return;
      }
      const data = (await response.json()) as { items?: SwipeCandidate[] };
      if (!cancelled) {
        setCandidates(data.items ?? []);
        setLoadingCandidates(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const reactionEntries = useMemo(
    () =>
      candidates.map((candidate) => ({
        movieId: candidate.movieId,
        reactionType: reactions[candidate.movieId],
      })),
    [candidates, reactions],
  );

  const answeredCount = reactionEntries.filter((entry) => Boolean(entry.reactionType)).length;
  const canSubmit = answeredCount === 14;

  const setReaction = (movieId: string, reactionType: OnboardingReactionType) => {
    setReactions((prev) => ({ ...prev, [movieId]: reactionType }));
    setActiveIndex((prev) => Math.min(prev + 1, 13));
  };

  const submit = async () => {
    setState("loading");
    setErrorMessage("");

    try {
      const payloadReactions: OnboardingReaction[] = candidates.flatMap((candidate) => {
        const reactionType = reactions[candidate.movieId];
        if (reactionType === undefined) return [];
        return [{ movieId: candidate.movieId, reactionType }];
      });

      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mbtiType,
          selectedMood,
          reactions: payloadReactions,
          onboardingVersion: 1,
        }),
      });

      if (!response.ok) {
        let message = "入力を確認してください。";
        try {
          const data = (await response.json()) as { message?: string; code?: string };
          if (data.code === "SESSION_STALE") {
            message = "セッションが切れています。再ログインしてください。";
            router.push("/login?error=session_stale");
          } else if (data.message) {
            message = data.message;
          }
        } catch {
          // Keep fallback message when server response is not JSON.
        }
        setState("error");
        setErrorMessage(message);
        return;
      }

      router.push("/profile/taste");
      router.refresh();
    } catch {
      setState("error");
      setErrorMessage("保存に失敗しました。ネットワーク状態を確認して再試行してください。");
    }
  };

  return (
    <section className="mt-6 space-y-6">
      <PopCard tone="highlight" className="space-y-3">
        <p className="text-heading">3秒オンボーディング</p>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-bg-elevated)]">
          <div className="h-full rounded-full bg-[var(--color-accent)] transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-[var(--color-text-secondary)]">Step {step} / 3</p>
      </PopCard>

      {step === 1 && (
        <PopCard tone="surface" className="space-y-4">
          <h2 className="text-base font-[500]">MBTI と今の気分</h2>
          <div className="flex flex-wrap gap-2">
            {MBTI_TYPES.map((mbti) => (
              <MoodChip key={mbti} label={mbti} selected={mbtiType === mbti} onClick={() => setMbtiType(mbti)} />
            ))}
          </div>
          <p className="text-sm font-[500]">今の気分（1つ選択）</p>
          <div className="flex flex-wrap gap-2">
            {USER_MOODS.map((mood) => (
              <MoodChip key={mood} label={mood} selected={selectedMood === mood} onClick={() => setSelectedMood(mood)} />
            ))}
          </div>
          <PopButton className="w-full" disabled={!mbtiType || !selectedMood} onClick={() => setStep(2)}>
            映画リアクションへ
          </PopButton>
        </PopCard>
      )}

      {step === 2 && (
        <PopCard tone="surface" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-[500]">14本にリアクション</h2>
            <p className="text-xs text-[var(--color-text-secondary)]">{answeredCount}/14</p>
          </div>
          {loadingCandidates && <p className="text-sm text-[var(--color-text-secondary)]">候補を読み込み中...</p>}
          {candidateError && <p className="text-sm text-[var(--color-streaming)]">{candidateError}</p>}
          {!loadingCandidates && currentMovie && (
            <div className="space-y-3">
              <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] p-4">
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-bg-elevated)]">
                  <Image src={currentMovie.posterUrl} alt={`${currentMovie.title} poster`} fill className="object-cover" sizes="(max-width: 768px) 92vw, 520px" />
                </div>
                <h3 className="mt-3 text-lg font-[500]">
                  {currentMovie.title}
                  {currentMovie.releaseYear ? ` (${currentMovie.releaseYear})` : ""}
                </h3>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  {[currentMovie.genrePrimary, currentMovie.genreSecondary].filter(Boolean).join(" / ")}
                </p>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)] line-clamp-4">{currentMovie.overview ?? "あらすじは未登録です。"}</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <PopButton onClick={() => setReaction(currentMovie.movieId, "not_for_me")}>{REACTION_LABELS.not_for_me}</PopButton>
                <PopButton variant="secondary" onClick={() => setReaction(currentMovie.movieId, "dont_know")}>
                  {REACTION_LABELS.dont_know}
                </PopButton>
                <PopButton onClick={() => setReaction(currentMovie.movieId, "liked")}>{REACTION_LABELS.liked}</PopButton>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <PopButton variant="ghost" onClick={() => setStep(1)}>
              戻る
            </PopButton>
            <PopButton disabled={!canSubmit} onClick={() => setStep(3)}>
              最終確認へ
            </PopButton>
          </div>
        </PopCard>
      )}

      {step === 3 && (
        <PopCard tone="surface" className="space-y-4">
          <h2 className="text-base font-[500]">最終確認</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p>MBTI: {mbtiType}</p>
            <p>ムード: {selectedMood}</p>
            <p>回答数: {answeredCount}件</p>
            <p>liked: {reactionEntries.filter((entry) => entry.reactionType === "liked").length}件</p>
            <p>not_for_me: {reactionEntries.filter((entry) => entry.reactionType === "not_for_me").length}件</p>
            <p>dont_know: {reactionEntries.filter((entry) => entry.reactionType === "dont_know").length}件</p>
          </div>
          {state === "error" && <p className="text-sm text-[var(--color-streaming)]">{errorMessage}</p>}
          <div className="flex gap-2">
            <PopButton variant="ghost" className="flex-1" onClick={() => setStep(2)}>
              戻る
            </PopButton>
            <PopButton className="flex-1" disabled={state === "loading" || !canSubmit} onClick={() => void submit()}>
              {state === "loading" ? "保存中..." : "ワンタップで完了"}
            </PopButton>
          </div>
        </PopCard>
      )}
    </section>
  );
}
