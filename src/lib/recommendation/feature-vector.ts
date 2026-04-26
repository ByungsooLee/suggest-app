export const FEATURE_DIMENSIONS = [
  "moodCalm",
  "moodDark",
  "moodEmotional",
  "moodUplifting",
  "toneStylish",
  "toneFunny",
  "paceFast",
  "paceSlowBurn",
  "complexity",
  "emotionalWeight",
  "tension",
  "accessibility",
] as const;

export type FeatureDimension = (typeof FEATURE_DIMENSIONS)[number];
export type FeatureVector = Record<FeatureDimension, number>;

export const EMPTY_VECTOR: FeatureVector = {
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
};

export const ZERO_VECTOR: FeatureVector = {
  moodCalm: 0,
  moodDark: 0,
  moodEmotional: 0,
  moodUplifting: 0,
  toneStylish: 0,
  toneFunny: 0,
  paceFast: 0,
  paceSlowBurn: 0,
  complexity: 0,
  emotionalWeight: 0,
  tension: 0,
  accessibility: 0,
};

export function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function clampVector(vector: FeatureVector): FeatureVector {
  const next = { ...vector };
  for (const key of FEATURE_DIMENSIONS) {
    next[key] = clamp01(next[key]);
  }
  return next;
}

export function addVectors(a: FeatureVector, b: FeatureVector): FeatureVector {
  const next = { ...EMPTY_VECTOR };
  for (const key of FEATURE_DIMENSIONS) {
    next[key] = a[key] + b[key];
  }
  return next;
}

export function subtractVectors(a: FeatureVector, b: FeatureVector): FeatureVector {
  const next = { ...EMPTY_VECTOR };
  for (const key of FEATURE_DIMENSIONS) {
    next[key] = a[key] - b[key];
  }
  return next;
}

export function scaleVector(vector: FeatureVector, weight: number): FeatureVector {
  const next = { ...EMPTY_VECTOR };
  for (const key of FEATURE_DIMENSIONS) {
    next[key] = vector[key] * weight;
  }
  return next;
}

export function averageVectors(vectors: FeatureVector[]): FeatureVector | null {
  if (vectors.length === 0) return null;
  const sum = { ...ZERO_VECTOR };
  for (const vector of vectors) {
    for (const key of FEATURE_DIMENSIONS) {
      sum[key] += vector[key];
    }
  }
  return scaleVector(sum, 1 / vectors.length);
}

export function cosineSimilarity(a: FeatureVector, b: FeatureVector): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (const key of FEATURE_DIMENSIONS) {
    dot += a[key] * b[key];
    magA += a[key] * a[key];
    magB += b[key] * b[key];
  }
  if (magA === 0 || magB === 0) return 0;
  const cosine = dot / (Math.sqrt(magA) * Math.sqrt(magB));
  return clamp01((cosine + 1) / 2);
}

export function extractMovieVector(movie: {
  moodCalm: number;
  moodDark: number;
  moodEmotional: number;
  moodUplifting: number;
  toneStylish: number;
  toneFunny: number;
  paceFast: number;
  paceSlowBurn: number;
  complexity: number;
  emotionalWeight: number;
  tension: number;
  accessibility: number;
}): FeatureVector {
  return {
    moodCalm: movie.moodCalm,
    moodDark: movie.moodDark,
    moodEmotional: movie.moodEmotional,
    moodUplifting: movie.moodUplifting,
    toneStylish: movie.toneStylish,
    toneFunny: movie.toneFunny,
    paceFast: movie.paceFast,
    paceSlowBurn: movie.paceSlowBurn,
    complexity: movie.complexity,
    emotionalWeight: movie.emotionalWeight,
    tension: movie.tension,
    accessibility: movie.accessibility,
  };
}
