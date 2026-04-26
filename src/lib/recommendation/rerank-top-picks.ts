import { TOP3_RERANK_SLOT_WEIGHTS } from "@/lib/recommendation/constants";
import { type FeatureVector, EMPTY_VECTOR, clamp01, cosineSimilarity, subtractVectors } from "@/lib/recommendation/feature-vector";

type RerankCandidate<T> = T & {
  preRerankScore: number;
  repetitionPenalty: number;
  vector: FeatureVector;
};

export function rerankTopPicks<T extends object>(candidates: RerankCandidate<T>[], limit: number): RerankCandidate<T>[] {
  if (candidates.length <= 1) return candidates.slice(0, limit);

  const selected: RerankCandidate<T>[] = [];
  const remaining = [...candidates];

  while (selected.length < limit && remaining.length > 0) {
    const slotWeights = TOP3_RERANK_SLOT_WEIGHTS[Math.min(selected.length, TOP3_RERANK_SLOT_WEIGHTS.length - 1)];
    let bestIndex = 0;
    let bestObjective = -Infinity;

    for (let i = 0; i < remaining.length; i += 1) {
      const candidate = remaining[i];
      const normalizedPreRerank = clamp01(candidate.preRerankScore);
      const similarityPenalty =
        selected.length === 0
          ? 0
          : Math.max(
              ...selected.map((chosen) =>
                cosineSimilarity(
                  subtractVectors(chosen.vector, EMPTY_VECTOR),
                  subtractVectors(candidate.vector, EMPTY_VECTOR),
                ),
              ),
            );
      const samePrimaryGenrePenalty =
        selected.length === 0
          ? 0
          : selected.some((chosen) => {
              if (!("movie" in chosen) || !("movie" in candidate)) return false;
              const chosenMovie = chosen.movie as { genrePrimary?: string };
              const candidateMovie = candidate.movie as { genrePrimary?: string };
              return Boolean(chosenMovie.genrePrimary && chosenMovie.genrePrimary === candidateMovie.genrePrimary);
            })
            ? 1
            : 0;
      const objective =
        normalizedPreRerank * slotWeights.relevance -
        similarityPenalty * slotWeights.diversity -
        candidate.repetitionPenalty * slotWeights.repetition -
        samePrimaryGenrePenalty * slotWeights.samePrimaryGenre;

      if (objective > bestObjective) {
        bestObjective = objective;
        bestIndex = i;
      }
    }

    selected.push(remaining.splice(bestIndex, 1)[0]);
  }

  return selected;
}
