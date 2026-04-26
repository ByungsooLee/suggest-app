import { ADJACENT_DISCOVERY_BAND, NOVELTY_WEIGHTS } from "@/lib/recommendation/constants";
import { clamp01 } from "@/lib/recommendation/feature-vector";

export type NoveltyBreakdown = {
  adjacentDiscoveryScore: number;
  clonePenaltyReverseScore: number;
  noveltyScore: number;
  tasteDistance: number;
};

function scoreDistanceBand(distance: number): number {
  const { minDistance, maxDistance, falloff, tooFarStart } = ADJACENT_DISCOVERY_BAND;
  if (distance >= minDistance && distance <= maxDistance) return 1;
  if (distance < minDistance) {
    return clamp01(1 - (minDistance - distance) / falloff);
  }
  if (distance >= tooFarStart) {
    return clamp01(1 - (distance - tooFarStart) / (1 - tooFarStart));
  }
  return clamp01(1 - (distance - maxDistance) / falloff);
}

function scoreClonePenaltyReverse(distance: number): number {
  const { cloneDistanceFloor } = ADJACENT_DISCOVERY_BAND;
  return clamp01((distance - cloneDistanceFloor) / (1 - cloneDistanceFloor));
}

export function scoreNovelty(args: { tasteSimilarity: number | null }): NoveltyBreakdown {
  if (args.tasteSimilarity == null) {
    return {
      adjacentDiscoveryScore: 0.55,
      clonePenaltyReverseScore: 0.55,
      noveltyScore: 0.55,
      tasteDistance: 0.45,
    };
  }

  const tasteDistance = clamp01(1 - args.tasteSimilarity);
  const adjacentDiscoveryScore = scoreDistanceBand(tasteDistance);
  const clonePenaltyReverseScore = scoreClonePenaltyReverse(tasteDistance);
  const noveltyScore =
    adjacentDiscoveryScore * NOVELTY_WEIGHTS.adjacentDiscovery +
    clonePenaltyReverseScore * NOVELTY_WEIGHTS.clonePenaltyReverse;

  return {
    adjacentDiscoveryScore,
    clonePenaltyReverseScore,
    noveltyScore: clamp01(noveltyScore),
    tasteDistance,
  };
}
