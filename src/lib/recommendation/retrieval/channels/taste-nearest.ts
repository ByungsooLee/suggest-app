import { RETRIEVAL_CHANNEL_QUOTAS } from "@/lib/recommendation/constants";
import { buildScoredCandidates, scoreTasteSimilarity, type ChannelContext } from "@/lib/recommendation/retrieval/channels/shared";

export function retrieveTasteNearest(context: ChannelContext) {
  const scored = buildScoredCandidates({
    channel: "taste_nearest",
    movies: context.movies,
    scoreOf: (_movie, vector) => scoreTasteSimilarity(context.knownTasteVector, vector),
  });
  return scored.slice(0, RETRIEVAL_CHANNEL_QUOTAS.taste_nearest);
}
