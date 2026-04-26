import { RETRIEVAL_CHANNEL_QUOTAS, RETRIEVAL_THRESHOLDS } from "@/lib/recommendation/constants";
import { cosineSimilarity } from "@/lib/recommendation/feature-vector";
import { computeQualityPrior } from "@/lib/recommendation/score-base";
import { buildScoredCandidates, scoreTasteSimilarity, type ChannelContext } from "@/lib/recommendation/retrieval/channels/shared";

export function retrieveQualityFit(context: ChannelContext) {
  const scored = buildScoredCandidates({
    channel: "quality_fit",
    movies: context.movies,
    scoreOf: (movie, vector) => {
      const reviewScore = movie.reviewScore ?? 0;
      if (reviewScore < RETRIEVAL_THRESHOLDS.qualityMinimumReview) return null;
      const tasteScore = scoreTasteSimilarity(context.knownTasteVector, vector) ?? 0.5;
      const moodScore = cosineSimilarity(context.moodVector, vector);
      const fitScore = Math.max(tasteScore, moodScore);
      if (fitScore < RETRIEVAL_THRESHOLDS.qualityFitMinimum) return null;
      return computeQualityPrior(reviewScore) * 0.6 + fitScore * 0.4;
    },
  });
  return scored.slice(0, RETRIEVAL_CHANNEL_QUOTAS.quality_fit);
}
