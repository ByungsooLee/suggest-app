"use client";

import { useState } from "react";

import { FEEDBACK_REACTIONS, type FeedbackReaction } from "@/lib/constants/taxonomy";
import { PopCard } from "@/components/ui/pop-card";
import { ReactionPill } from "@/components/ui/reaction-pill";

const LABELS: Record<FeedbackReaction, string> = {
  liked: "好き",
  too_dark: "重すぎた",
  too_long: "長すぎた",
  not_now: "今じゃない",
  mismatch: "気分と違う",
};
const EMOJI: Record<FeedbackReaction, string> = {
  liked: "😍",
  too_dark: "🌑",
  too_long: "🕒",
  not_now: "😴",
  mismatch: "🤔",
};

type FeedbackChipsProps = {
  sessionId: string;
  recommendationResultId?: string;
};

export function FeedbackChips({ sessionId, recommendationResultId }: FeedbackChipsProps) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  const submitReaction = async (reaction: FeedbackReaction) => {
    try {
      setState("loading");
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, recommendationResultId, reaction }),
      });
      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }
      setState("done");
    } catch {
      setState("error");
    }
  };

  return (
    <PopCard tone="muted" className="space-y-3">
      <h3 className="text-sm font-[500]">推薦フィードバック（ワンタップ）</h3>
      <div className="flex flex-wrap gap-2">
        {FEEDBACK_REACTIONS.map((reaction) => (
          <ReactionPill
            key={reaction}
            onClick={() => void submitReaction(reaction)}
            label={LABELS[reaction]}
            emoji={EMOJI[reaction]}
            disabled={state === "loading"}
          />
        ))}
      </div>
      {state === "loading" && <p className="text-xs text-[var(--color-text-secondary)]">保存中...</p>}
      {state === "done" && <p className="text-xs text-[var(--color-match-high)]">フィードバックを保存しました。</p>}
      {state === "error" && <p className="text-xs text-[var(--color-streaming)]">保存に失敗しました。再試行してください。</p>}
    </PopCard>
  );
}
