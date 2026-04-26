import { type FeatureVector, averageVectors, clampVector, scaleVector, subtractVectors } from "@/lib/recommendation/feature-vector";

export type KnownTasteWeightPreset =
  | { knownTasteWeight: 0.55; currentMoodWeight: 0.3; mbtiWeight: 0.15; mode: "standard" }
  | { knownTasteWeight: 0.4; currentMoodWeight: 0.45; mbtiWeight: 0.15; mode: "single_like" }
  | { knownTasteWeight: 0; currentMoodWeight: 0.75; mbtiWeight: 0.25; mode: "no_like" };

export function resolveWeightPreset(likedCount: number): KnownTasteWeightPreset {
  if (likedCount >= 2) {
    return { knownTasteWeight: 0.55, currentMoodWeight: 0.3, mbtiWeight: 0.15, mode: "standard" };
  }
  if (likedCount === 1) {
    return { knownTasteWeight: 0.4, currentMoodWeight: 0.45, mbtiWeight: 0.15, mode: "single_like" };
  }
  return { knownTasteWeight: 0, currentMoodWeight: 0.75, mbtiWeight: 0.25, mode: "no_like" };
}

type WeightedVector = {
  vector: FeatureVector;
  weight: number;
};

function averageWeightedVectors(entries: WeightedVector[]): FeatureVector | null {
  if (entries.length === 0) return null;
  const expanded: FeatureVector[] = [];
  for (const entry of entries) {
    const normalizedWeight = Math.max(0.1, Math.min(entry.weight, 3));
    const repeat = Math.round(normalizedWeight * 10);
    for (let i = 0; i < repeat; i += 1) {
      expanded.push(entry.vector);
    }
  }
  return averageVectors(expanded);
}

export function buildKnownTasteVector(args: {
  likedVectors: WeightedVector[];
  rejectedVectors: WeightedVector[];
}): FeatureVector | null {
  const likedAvg = averageWeightedVectors(args.likedVectors);
  if (!likedAvg) return null;

  const rejectedAvg = averageWeightedVectors(args.rejectedVectors);
  if (!rejectedAvg) {
    return clampVector(likedAvg);
  }

  const weightedRejected = scaleVector(rejectedAvg, 0.7);
  return clampVector(subtractVectors(likedAvg, weightedRejected));
}
