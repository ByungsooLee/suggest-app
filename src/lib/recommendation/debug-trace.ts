import { RETRIEVAL_SUPPORT } from "@/lib/recommendation/constants";
import { clamp01 } from "@/lib/recommendation/feature-vector";
import { type RetrievalCandidate, type RetrievalTrace } from "@/lib/recommendation/types";

export function buildRetrievalTrace(candidates: RetrievalCandidate[]): RetrievalTrace {
  if (candidates.length === 0) {
    return {
      channels: [],
      bestChannel: "taste_nearest",
      bestChannelScore: 0,
      retrievalSupportScore: 0,
    };
  }
  const sorted = [...candidates].sort((a, b) => b.channelScore - a.channelScore);
  const best = sorted[0];
  const channelSet = new Set(sorted.map((entry) => entry.channel));
  const multiHitBonus = Math.min(
    (channelSet.size - 1) * RETRIEVAL_SUPPORT.multiHitBonus,
    RETRIEVAL_SUPPORT.maxMultiHitBonus,
  );
  return {
    channels: [...channelSet],
    bestChannel: best.channel,
    bestChannelScore: best.channelScore,
    retrievalSupportScore: clamp01(best.channelScore + multiHitBonus),
  };
}
