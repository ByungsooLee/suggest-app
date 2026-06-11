import { RETRIEVAL_SUPPORT } from "@/lib/recommendation/constants";
import { FEATURE_DIMENSIONS, type FeatureDimension, type FeatureVector } from "@/lib/recommendation/feature-vector";
import { clamp01 } from "@/lib/recommendation/feature-vector";
import { type RetrievalCandidate, type RetrievalChannel, type RetrievalTrace } from "@/lib/recommendation/types";

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
