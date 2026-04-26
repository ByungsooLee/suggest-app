import { ADJACENT_DISCOVERY_BAND, RETRIEVAL_CHANNEL_QUOTAS, RETRIEVAL_THRESHOLDS } from "@/lib/recommendation/constants";
import { clamp01 } from "@/lib/recommendation/feature-vector";
import { computeQualityPrior } from "@/lib/recommendation/score-base";
import { scoreTasteSimilarity, buildScoredCandidates, type ChannelContext } from "@/lib/recommendation/retrieval/channels/shared";

function scoreAdjacentBand(distance: number): number {
  const { minDistance, maxDistance, falloff, tooFarStart } = ADJACENT_DISCOVERY_BAND;
  if (distance < minDistance) {
    return clamp01(1 - (minDistance - distance) / falloff);
  }
  if (distance <= maxDistance) {
    return 1;
  }
  if (distance >= tooFarStart) {
    return clamp01(1 - (distance - tooFarStart) / (1 - tooFarStart));
  }
  return clamp01(1 - (distance - maxDistance) / falloff);
}

export function retrieveAdjacentDiscovery(context: ChannelContext) {
  const scored = buildScoredCandidates({
    channel: "adjacent_discovery",
    movies: context.movies,
    scoreOf: (movie, vector) => {
      const tasteScore = scoreTasteSimilarity(context.knownTasteVector, vector);
      if (tasteScore == null) return null;
      const distance = clamp01(1 - tasteScore);
      if (distance < RETRIEVAL_THRESHOLDS.adjacentMin || distance > RETRIEVAL_THRESHOLDS.adjacentMax) return null;
      const adjacent = scoreAdjacentBand(distance);
      return adjacent * 0.7 + computeQualityPrior(movie.reviewScore) * 0.3;
    },
  });
  return scored.slice(0, RETRIEVAL_CHANNEL_QUOTAS.adjacent_discovery);
}
