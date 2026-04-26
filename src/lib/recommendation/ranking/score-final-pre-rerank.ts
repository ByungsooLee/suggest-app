import { PRE_RERANK_WEIGHTS } from "@/lib/recommendation/constants";
import { clamp01 } from "@/lib/recommendation/feature-vector";

export function scoreFinalPreRerank(args: {
  baseScore: number;
  noveltyScore: number;
  repetitionPenalty: number;
  recommendationStyleMode?: "safe" | "balanced" | "discovery_focused";
}): number {
  const mode = args.recommendationStyleMode ?? "balanced";
  const modeWeights =
    mode === "safe"
      ? { base: 0.9, novelty: 0.1, repetitionPenalty: 0.18 }
      : mode === "discovery_focused"
        ? { base: 0.74, novelty: 0.26, repetitionPenalty: 0.12 }
        : PRE_RERANK_WEIGHTS;
  const weighted =
    args.baseScore * modeWeights.base +
    args.noveltyScore * modeWeights.novelty -
    args.repetitionPenalty * modeWeights.repetitionPenalty;
  return clamp01(weighted);
}
