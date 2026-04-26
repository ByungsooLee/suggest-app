import { RETRIEVAL_CHANNEL_QUOTAS, RETRIEVAL_THRESHOLDS } from "@/lib/recommendation/constants";
import { cosineSimilarity } from "@/lib/recommendation/feature-vector";
import { buildScoredCandidates, type ChannelContext } from "@/lib/recommendation/retrieval/channels/shared";

export function retrieveMoodCompatible(context: ChannelContext) {
  const scored = buildScoredCandidates({
    channel: "mood_compatible",
    movies: context.movies,
    scoreOf: (_movie, vector) => {
      const moodScore = cosineSimilarity(context.moodVector, vector);
      if (moodScore < RETRIEVAL_THRESHOLDS.moodMinimum) return null;
      return moodScore;
    },
  });
  return scored.slice(0, RETRIEVAL_CHANNEL_QUOTAS.mood_compatible);
}
