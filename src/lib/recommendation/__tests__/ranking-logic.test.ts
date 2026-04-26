import test from "node:test";
import assert from "node:assert/strict";

import { rerankTopPicks } from "@/lib/recommendation/rerank-top-picks";
import { buildRecentRecommendationIndex, computeRepetitionPenalty } from "@/lib/recommendation/repetition-control";
import { scoreBaseRelevance } from "@/lib/recommendation/score-base";
import { type FeatureVector, EMPTY_VECTOR, cosineSimilarity } from "@/lib/recommendation/feature-vector";
import { scoreNovelty } from "@/lib/recommendation/score-novelty";

function vector(overrides: Partial<FeatureVector>): FeatureVector {
  return { ...EMPTY_VECTOR, ...overrides };
}

test("scoreBaseRelevance uses watch context and creator affinity", () => {
  const candidateVector = vector({ moodCalm: 0.8, toneFunny: 0.78 });
  const knownTasteVector = vector({ moodCalm: 0.82, toneFunny: 0.72 });
  const moodVector = vector({ moodCalm: 0.86 });
  const mbtiVector = vector({ accessibility: 0.6 });

  const withPreferred = scoreBaseRelevance({
    candidateVector,
    knownTasteVector,
    moodVector,
    mbtiVector,
    hasMbtiSignal: true,
    watchingWith: "friends_hangout",
    preferredDirectors: ["Wes Anderson"],
    preferredActors: ["Scarlett Johansson"],
    candidate: {
      watchContexts: ["friends_hangout"],
      directors: ["Wes Anderson"],
      cast: ["Scarlett Johansson"],
      reviewScore: 8.4,
    },
    currentMoods: ["calm"],
    retrievalSupportScore: 0.7,
  });

  const withoutPreferred = scoreBaseRelevance({
    candidateVector,
    knownTasteVector,
    moodVector,
    mbtiVector,
    hasMbtiSignal: true,
    watchingWith: "friends_hangout",
    preferredDirectors: [],
    preferredActors: [],
    candidate: {
      watchContexts: ["family_time"],
      directors: ["Other Director"],
      cast: ["Other Actor"],
      reviewScore: 8.4,
    },
    currentMoods: ["calm"],
    retrievalSupportScore: 0.4,
  });

  assert.ok(withPreferred.creatorAffinityScore > withoutPreferred.creatorAffinityScore);
  assert.ok(withPreferred.watchContextScore > withoutPreferred.watchContextScore);
  assert.ok(withPreferred.baseScore > withoutPreferred.baseScore);
});

test("scoreNovelty rewards adjacent distance over near-clone distance", () => {
  const nearClone = scoreNovelty({ tasteSimilarity: 0.94 });
  const adjacent = scoreNovelty({ tasteSimilarity: 0.7 });

  assert.ok(adjacent.noveltyScore > nearClone.noveltyScore);
  assert.ok(adjacent.adjacentDiscoveryScore > nearClone.adjacentDiscoveryScore);
});

test("repetition penalty is higher for recent rank-1 repeats", () => {
  const recent = buildRecentRecommendationIndex([
    { movieIdsByRank: ["m1", "m2", "m3"] },
    { movieIdsByRank: ["m4", "m1", "m5"] },
  ]);

  const repeatedPenalty = computeRepetitionPenalty({
    movieId: "m1",
    recentRecommendations: recent,
  });
  const freshPenalty = computeRepetitionPenalty({
    movieId: "new_movie",
    recentRecommendations: recent,
  });

  assert.ok(repeatedPenalty > freshPenalty);
  assert.ok(repeatedPenalty > 0.65);
});

test("rerankTopPicks picks a less-similar backup when scores are close", () => {
  const topVector = vector({ moodCalm: 0.9, toneFunny: 0.75 });
  const cloneVector = vector({ moodCalm: 0.89, toneFunny: 0.74 });
  const diverseVector = vector({ moodDark: 0.8, tension: 0.76 });

  const candidates = [
    { id: "top", preRerankScore: 0.91, repetitionPenalty: 0.05, vector: topVector },
    { id: "clone", preRerankScore: 0.89, repetitionPenalty: 0.05, vector: cloneVector },
    { id: "diverse", preRerankScore: 0.88, repetitionPenalty: 0.05, vector: diverseVector },
  ];

  const [first, second] = rerankTopPicks(candidates, 3);
  assert.equal(first.id, "top");

  const cloneSimilarity = cosineSimilarity(first.vector, cloneVector);
  const diverseSimilarity = cosineSimilarity(first.vector, diverseVector);
  assert.ok(cloneSimilarity > diverseSimilarity);
  assert.equal(second.id, "diverse");
});
