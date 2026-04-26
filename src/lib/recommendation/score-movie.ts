import { type KnownTasteWeightPreset } from "@/lib/recommendation/build-known-taste-vector";
import { type FeatureVector, cosineSimilarity } from "@/lib/recommendation/feature-vector";

export type ScoreBreakdown = {
  knownTasteScore: number;
  currentMoodScore: number;
  mbtiAdjustmentScore: number;
  totalScore: number;
};

export function scoreMovie(args: {
  candidateVector: FeatureVector;
  knownTasteVector: FeatureVector | null;
  moodVector: FeatureVector;
  mbtiVector: FeatureVector;
  weights: KnownTasteWeightPreset;
}): ScoreBreakdown {
  const knownTasteScore = args.knownTasteVector ? cosineSimilarity(args.knownTasteVector, args.candidateVector) : 0;
  const currentMoodScore = cosineSimilarity(args.moodVector, args.candidateVector);
  const mbtiAdjustmentScore = cosineSimilarity(args.mbtiVector, args.candidateVector);

  const totalScore =
    knownTasteScore * args.weights.knownTasteWeight +
    currentMoodScore * args.weights.currentMoodWeight +
    mbtiAdjustmentScore * args.weights.mbtiWeight;

  return {
    knownTasteScore,
    currentMoodScore,
    mbtiAdjustmentScore,
    totalScore,
  };
}
