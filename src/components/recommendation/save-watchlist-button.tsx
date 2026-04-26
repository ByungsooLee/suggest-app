"use client";

import { useState } from "react";

import { PopButton } from "@/components/ui/pop-button";

type SaveWatchlistButtonProps = {
  movieId: string;
  title: string;
  posterUrl?: string | null;
  recommendationResultId?: string;
};

export function SaveWatchlistButton({ movieId, title, posterUrl, recommendationResultId }: SaveWatchlistButtonProps) {
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");

  const save = async () => {
    setState("saving");
    try {
      const response = await fetch("/api/me/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: "movie",
          movieId,
          title,
          posterUrl: posterUrl ?? undefined,
          source: "recommendation",
          recommendedFromResultId: recommendationResultId,
        }),
      });
      if (!response.ok) throw new Error("failed");
      setState("done");
    } catch {
      setState("error");
    }
  };

  return (
    <PopButton variant="secondary" onClick={save} disabled={state === "saving" || state === "done"}>
      {state === "saving" ? "保存中..." : state === "done" ? "保存済み" : state === "error" ? "再試行" : "あとで観るに保存"}
    </PopButton>
  );
}
