import { FEATURE_DIMENSIONS, type FeatureDimension, type FeatureVector } from "@/lib/recommendation/feature-vector";
import { type RetrievalChannel } from "@/lib/recommendation/types";

export type RecommendationTrace = {
  matchedFeatures: FeatureDimension[];
  strongestComponent:
    | "tasteScore"
    | "moodScore"
    | "mbtiScore"
    | "watchContextScore"
    | "creatorAffinityScore"
    | "genrePreferenceScore"
    | "qualityPriorScore";
  avoidedExclusions: string[];
  retrievalChannels: RetrievalChannel[];
};

function strongestComponent(score: {
  tasteScore: number;
  moodScore: number;
  mbtiScore: number;
  watchContextScore: number;
  creatorAffinityScore: number;
  genrePreferenceScore: number;
  qualityPriorScore: number;
}): RecommendationTrace["strongestComponent"] {
  const sorted = Object.entries(score).sort((a, b) => b[1] - a[1]);
  return sorted[0][0] as RecommendationTrace["strongestComponent"];
}

export function buildRecommendationTrace(args: {
  candidateVector: FeatureVector;
  referenceVector: FeatureVector;
  scoreBreakdown: {
    tasteScore: number;
    moodScore: number;
    mbtiScore: number;
    watchContextScore: number;
    creatorAffinityScore: number;
    genrePreferenceScore: number;
    qualityPriorScore: number;
  };
  avoidedExclusions?: string[];
  retrievalChannels?: RetrievalChannel[];
}): RecommendationTrace {
  const featureMatches = FEATURE_DIMENSIONS.map((key) => ({
    key,
    delta: Math.abs(args.candidateVector[key] - args.referenceVector[key]),
  }))
    .sort((a, b) => a.delta - b.delta)
    .slice(0, 4)
    .map((item) => item.key);

  return {
    matchedFeatures: featureMatches,
    strongestComponent: strongestComponent(args.scoreBreakdown),
    avoidedExclusions: args.avoidedExclusions ?? [],
    retrievalChannels: args.retrievalChannels ?? [],
  };
}
