import { RETRIEVAL_CHANNEL_QUOTAS } from "@/lib/recommendation/constants";
import { computeCreatorAffinity } from "@/lib/recommendation/score-base";
import { buildScoredCandidates, type ChannelContext } from "@/lib/recommendation/retrieval/channels/shared";

export function retrieveCreatorAffinity(
  context: ChannelContext & {
    preferredDirectors: string[];
    preferredActors: string[];
  },
) {
  const scored = buildScoredCandidates({
    channel: "creator_affinity",
    movies: context.movies,
    scoreOf: (movie) => {
      const affinity = computeCreatorAffinity({
        preferredDirectors: context.preferredDirectors,
        preferredActors: context.preferredActors,
        movieDirectors: movie.directors,
        movieCast: movie.cast,
      });
      if (!affinity.active || affinity.score <= 0) return null;
      return affinity.score;
    },
  });
  return scored.slice(0, RETRIEVAL_CHANNEL_QUOTAS.creator_affinity);
}
