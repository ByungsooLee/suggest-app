import { type FeatureVector, cosineSimilarity } from "@/lib/recommendation/feature-vector";

type Candidate<T> = T & {
  totalScore: number;
  vector: FeatureVector;
};

export function diversifyResults<T extends object>(candidates: Candidate<T>[], limit: number): Candidate<T>[] {
  if (candidates.length <= 1) return candidates.slice(0, limit);

  const sorted = [...candidates].sort((a, b) => b.totalScore - a.totalScore);
  const selected: Candidate<T>[] = [];
  const remaining = [...sorted];

  while (selected.length < limit && remaining.length > 0) {
    if (selected.length === 0) {
      selected.push(remaining.shift()!);
      continue;
    }

    let bestIndex = 0;
    let bestScore = -Infinity;
    for (let i = 0; i < remaining.length; i += 1) {
      const candidate = remaining[i];
      const maxSimilarity = Math.max(...selected.map((chosen) => cosineSimilarity(chosen.vector, candidate.vector)));
      const diversifiedScore = candidate.totalScore - maxSimilarity * 0.1;
      if (diversifiedScore > bestScore) {
        bestScore = diversifiedScore;
        bestIndex = i;
      }
    }
    selected.push(remaining.splice(bestIndex, 1)[0]);
  }

  return selected;
}
