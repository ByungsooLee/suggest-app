export const BASE_SCORE_WEIGHTS = {
  taste: 0.33,
  mood: 0.22,
  watchContext: 0.12,
  creatorAffinity: 0.11,
  genrePreference: 0.07,
  qualityPrior: 0.1,
  mbti: 0.06,
  retrievalSupport: 0.06,
} as const;

export const NOVELTY_WEIGHTS = {
  adjacentDiscovery: 0.7,
  clonePenaltyReverse: 0.3,
} as const;

export const PRE_RERANK_WEIGHTS = {
  base: 0.82,
  novelty: 0.18,
  repetitionPenalty: 0.16,
} as const;

export const ADJACENT_DISCOVERY_BAND = {
  minDistance: 0.18,
  maxDistance: 0.4,
  falloff: 0.25,
  cloneDistanceFloor: 0.12,
  tooFarStart: 0.55,
} as const;

export const TOP3_RERANK_SLOT_WEIGHTS = [
  { relevance: 0.84, diversity: 0.1, repetition: 0.06, samePrimaryGenre: 0.02 },
  { relevance: 0.64, diversity: 0.24, repetition: 0.12, samePrimaryGenre: 0.04 },
  { relevance: 0.58, diversity: 0.28, repetition: 0.14, samePrimaryGenre: 0.06 },
] as const;

export const CONTEXT_MATCH_SCORES = {
  exact: 1,
  adjacent: 0.66,
  weak: 0.35,
  none: 0,
} as const;

export const WATCH_CONTEXT_ADJACENCY: Record<string, readonly string[]> = {
  solo_watch: ["late_night_fit", "family_time"],
  date_friendly: ["late_night_fit", "friends_hangout"],
  friends_hangout: ["date_friendly", "late_night_fit"],
  family_time: ["solo_watch"],
  late_night_fit: ["solo_watch", "date_friendly", "friends_hangout"],
};

export const REPETITION_CONTROL = {
  maxSessions: 6,
  rankPenalty: {
    1: 1,
    2: 0.8,
    3: 0.6,
  },
  sessionDecay: 0.72,
  hardRepeatThreshold: 0.95,
  globalExposureWeight: 0.3,
  userCooldownWeight: 0.7,
} as const;

export const DEFAULT_QUALITY_PRIOR = 0.55;

export const RETRIEVAL_CHANNEL_QUOTAS = {
  taste_nearest: 120,
  mood_compatible: 80,
  watch_context: 60,
  creator_affinity: 50,
  quality_fit: 60,
  adjacent_discovery: 70,
} as const;

export const RETRIEVAL_POOL_LIMITS = {
  target: 220,
  min: 120,
  max: 320,
  channelCap: 90,
} as const;

export const RETRIEVAL_SUPPORT = {
  multiHitBonus: 0.06,
  maxMultiHitBonus: 0.24,
} as const;

export const RETRIEVAL_THRESHOLDS = {
  moodMinimum: 0.52,
  qualityMinimumReview: 7.2,
  qualityFitMinimum: 0.5,
  adjacentMin: ADJACENT_DISCOVERY_BAND.minDistance,
  adjacentMax: ADJACENT_DISCOVERY_BAND.maxDistance,
} as const;

export const RECOMMENDATION_FEATURE_FLAGS = {
  enableGlobalExposureDampening: false,
} as const;
