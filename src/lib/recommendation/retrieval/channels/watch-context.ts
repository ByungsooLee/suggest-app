import { RETRIEVAL_CHANNEL_QUOTAS } from "@/lib/recommendation/constants";
import { computeQualityPrior, computeWatchContextScore } from "@/lib/recommendation/score-base";
import { buildScoredCandidates, type ChannelContext } from "@/lib/recommendation/retrieval/channels/shared";
import { type WatchContext } from "@/lib/constants/taxonomy";

export function retrieveWatchContext(context: ChannelContext & { watchingWith: WatchContext }) {
  const scored = buildScoredCandidates({
    channel: "watch_context",
    movies: context.movies,
    scoreOf: (movie) => {
      const contextFit = computeWatchContextScore(context.watchingWith, movie.watchContexts);
      if (contextFit <= 0) return null;
      return contextFit * 0.75 + computeQualityPrior(movie.reviewScore) * 0.25;
    },
  });
  return scored.slice(0, RETRIEVAL_CHANNEL_QUOTAS.watch_context);
}
