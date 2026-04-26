import assert from "node:assert/strict";
import test from "node:test";

import { scoreFinalPreRerank } from "@/lib/recommendation/ranking/score-final-pre-rerank";
import { runRetrieval } from "@/lib/recommendation/retrieval/run-retrieval";
import { type CandidateMovie } from "@/lib/recommendation/types";
import { type FeatureVector, EMPTY_VECTOR } from "@/lib/recommendation/feature-vector";

function movie(id: string, overrides: Partial<CandidateMovie>): CandidateMovie {
  return {
    id,
    title: `Movie-${id}`,
    genrePrimary: "drama",
    genreSecondary: null,
    runtimeMinutes: 120,
    contentWarnings: [],
    moodTags: ["calm"],
    watchContexts: ["solo_watch"],
    directors: [],
    cast: [],
    reviewScore: 7.4,
    moodCalm: 0.5,
    moodDark: 0.5,
    moodEmotional: 0.5,
    moodUplifting: 0.5,
    toneStylish: 0.5,
    toneFunny: 0.5,
    paceFast: 0.5,
    paceSlowBurn: 0.5,
    complexity: 0.5,
    emotionalWeight: 0.5,
    tension: 0.5,
    accessibility: 0.5,
    ...overrides,
  };
}

function vector(overrides: Partial<FeatureVector>): FeatureVector {
  return { ...EMPTY_VECTOR, ...overrides };
}

test("runRetrieval merges channels and keeps retrieval trace", () => {
  const catalog: CandidateMovie[] = [
    movie("taste-1", { moodCalm: 0.85, toneFunny: 0.75, reviewScore: 8.2 }),
    movie("mood-1", { moodUplifting: 0.88, toneFunny: 0.8, watchContexts: ["friends_hangout"], reviewScore: 7.9 }),
    movie("context-1", { watchContexts: ["date_friendly"], reviewScore: 7.5 }),
    movie("creator-1", { directors: ["Wes Anderson"], cast: ["Bill Murray"], reviewScore: 8.5 }),
    movie("adjacent-1", { moodDark: 0.78, tension: 0.76, reviewScore: 8.0 }),
  ];

  const retrieved = runRetrieval({
    movies: catalog,
    knownTasteVector: vector({ moodCalm: 0.9, toneFunny: 0.82 }),
    moodVector: vector({ moodUplifting: 0.86, toneFunny: 0.8 }),
    watchingWith: "date_friendly",
    preferredDirectors: ["Wes Anderson"],
    preferredActors: ["Bill Murray"],
  });

  assert.ok(retrieved.length > 0);
  assert.ok(retrieved.some((entry) => entry.retrievalTrace.channels.length >= 1));
  assert.ok(retrieved.every((entry) => entry.retrievalTrace.retrievalSupportScore >= 0));
});

test("scoreFinalPreRerank decreases with stronger repetition penalty", () => {
  const lowPenalty = scoreFinalPreRerank({
    baseScore: 0.82,
    noveltyScore: 0.74,
    repetitionPenalty: 0.1,
  });
  const highPenalty = scoreFinalPreRerank({
    baseScore: 0.82,
    noveltyScore: 0.74,
    repetitionPenalty: 0.8,
  });

  assert.ok(lowPenalty > highPenalty);
});
