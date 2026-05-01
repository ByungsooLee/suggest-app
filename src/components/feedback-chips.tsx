"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { FEEDBACK_REACTIONS, type FeedbackReaction } from "@/lib/constants/taxonomy";
import { PopCard } from "@/components/ui/pop-card";
import { ReactionPill } from "@/components/ui/reaction-pill";

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
  const t = useTranslations("feedback");
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
      <h3 className="text-sm font-[500]">{t("title")}</h3>
      <div className="flex flex-wrap gap-2">
        {FEEDBACK_REACTIONS.map((reaction) => (
          <ReactionPill
            key={reaction}
            onClick={() => void submitReaction(reaction)}
            label={t(`reactions.${reaction}`)}
            emoji={EMOJI[reaction]}
            disabled={state === "loading"}
          />
        ))}
      </div>
      {state === "loading" && <p className="text-xs text-[var(--color-text-secondary)]">{t("saving")}</p>}
      {state === "done" && <p className="text-xs text-[var(--color-match-high)]">{t("saved")}</p>}
      {state === "error" && <p className="text-xs text-[var(--color-streaming)]">{t("error")}</p>}
    </PopCard>
  );
}
