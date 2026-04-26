import { RETRIEVAL_POOL_LIMITS } from "@/lib/recommendation/constants";
import { buildRetrievalTrace } from "@/lib/recommendation/debug-trace";
import { type CandidateMovie, type RetrievalCandidate, type RetrievalTrace } from "@/lib/recommendation/types";
import { retrieveAdjacentDiscovery } from "@/lib/recommendation/retrieval/channels/adjacent-discovery";
import { retrieveCreatorAffinity } from "@/lib/recommendation/retrieval/channels/creator-affinity";
import { retrieveMoodCompatible } from "@/lib/recommendation/retrieval/channels/mood-compatible";
import { type ChannelContext } from "@/lib/recommendation/retrieval/channels/shared";
import { retrieveTasteNearest } from "@/lib/recommendation/retrieval/channels/taste-nearest";
import { retrieveQualityFit } from "@/lib/recommendation/retrieval/channels/quality-fit";
import { retrieveWatchContext } from "@/lib/recommendation/retrieval/channels/watch-context";
import { type FeatureVector } from "@/lib/recommendation/feature-vector";
import { type WatchContext } from "@/lib/constants/taxonomy";

export type AssembledRetrievalCandidate = {
  movie: CandidateMovie;
  vector: FeatureVector;
  retrievalTrace: RetrievalTrace;
};

function dedupeByMovieId(channels: RetrievalCandidate[][]): Map<string, RetrievalCandidate[]> {
  const map = new Map<string, RetrievalCandidate[]>();
  for (const channelCandidates of channels) {
    for (const candidate of channelCandidates) {
      const existing = map.get(candidate.movie.id) ?? [];
      existing.push(candidate);
      map.set(candidate.movie.id, existing);
    }
  }
  return map;
}

function applyChannelCap(candidates: AssembledRetrievalCandidate[]): AssembledRetrievalCandidate[] {
  const counts = new Map<string, number>();
  const capped: AssembledRetrievalCandidate[] = [];
  for (const candidate of candidates) {
    const channelKey = candidate.retrievalTrace.bestChannel;
    const currentCount = counts.get(channelKey) ?? 0;
    if (currentCount >= RETRIEVAL_POOL_LIMITS.channelCap) continue;
    counts.set(channelKey, currentCount + 1);
    capped.push(candidate);
  }
  return capped;
}

export function runRetrieval(args: {
  movies: CandidateMovie[];
  knownTasteVector: FeatureVector | null;
  moodVector: FeatureVector;
  watchingWith: WatchContext;
  preferredDirectors: string[];
  preferredActors: string[];
}): AssembledRetrievalCandidate[] {
  const context: ChannelContext = {
    movies: args.movies,
    knownTasteVector: args.knownTasteVector,
    moodVector: args.moodVector,
  };

  const channels = [
    retrieveTasteNearest(context),
    retrieveMoodCompatible(context),
    retrieveWatchContext({ ...context, watchingWith: args.watchingWith }),
    retrieveCreatorAffinity({
      ...context,
      preferredDirectors: args.preferredDirectors,
      preferredActors: args.preferredActors,
    }),
    retrieveQualityFit(context),
    retrieveAdjacentDiscovery(context),
  ];

  const deduped = dedupeByMovieId(channels);

  const merged = [...deduped.values()]
    .map((hits) => ({
      movie: hits[0].movie,
      vector: hits[0].vector,
      retrievalTrace: buildRetrievalTrace(hits),
    }))
    .sort((a, b) => b.retrievalTrace.retrievalSupportScore - a.retrievalTrace.retrievalSupportScore);

  const capped = applyChannelCap(merged);
  const bounded = capped.slice(0, RETRIEVAL_POOL_LIMITS.max);

  if (bounded.length >= RETRIEVAL_POOL_LIMITS.min) {
    return bounded.slice(0, RETRIEVAL_POOL_LIMITS.target);
  }

  return merged.slice(0, RETRIEVAL_POOL_LIMITS.min);
}
