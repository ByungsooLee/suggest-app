import { type CandidateMovie, type RetrievalCandidate, type RetrievalChannel } from "@/lib/recommendation/types";
import { type FeatureVector, cosineSimilarity, extractMovieVector } from "@/lib/recommendation/feature-vector";

export type ChannelContext = {
  movies: CandidateMovie[];
  knownTasteVector: FeatureVector | null;
  moodVector: FeatureVector;
};

export function buildScoredCandidates(args: {
  channel: RetrievalChannel;
  movies: CandidateMovie[];
  scoreOf: (movie: CandidateMovie, vector: FeatureVector) => number | null;
}): RetrievalCandidate[] {
  return args.movies
    .map((movie) => {
      const vector = extractMovieVector(movie);
      const score = args.scoreOf(movie, vector);
      if (score == null) return null;
      return {
        movie,
        vector,
        channel: args.channel,
        channelScore: score,
        channelRank: 0,
      } satisfies RetrievalCandidate;
    })
    .filter((value): value is RetrievalCandidate => Boolean(value))
    .sort((a, b) => b.channelScore - a.channelScore)
    .map((entry, index) => ({
      ...entry,
      channelRank: index + 1,
    }));
}

export function scoreTasteSimilarity(knownTasteVector: FeatureVector | null, candidateVector: FeatureVector): number | null {
  if (!knownTasteVector) return null;
  return cosineSimilarity(knownTasteVector, candidateVector);
}
