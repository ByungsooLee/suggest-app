import { type MoodTag, type WatchContext } from "@/lib/constants/taxonomy";
import { BASE_SCORE_WEIGHTS, CONTEXT_MATCH_SCORES, DEFAULT_QUALITY_PRIOR, WATCH_CONTEXT_ADJACENCY } from "@/lib/recommendation/constants";
import { type FeatureVector, clamp01, cosineSimilarity } from "@/lib/recommendation/feature-vector";

type BaseComponent = {
  value: number;
  weight: number;
  active: boolean;
};

type BaseCandidate = {
  genrePrimary?: string;
  genreSecondary: string | null;
  watchContexts: string[];
  directors: string[];
  cast: string[];
  reviewScore: number | null;
};

export type BaseScoreBreakdown = {
  tasteScore: number;
  moodScore: number;
  mbtiScore: number;
  watchContextScore: number;
  creatorAffinityScore: number;
  genrePreferenceScore: number;
  qualityPriorScore: number;
  retrievalSupportScore: number;
  baseScore: number;
  components: {
    taste: BaseComponent;
    mood: BaseComponent;
    mbti: BaseComponent;
    watchContext: BaseComponent;
    creatorAffinity: BaseComponent;
    genrePreference: BaseComponent;
    qualityPrior: BaseComponent;
    retrievalSupport: BaseComponent;
  };
};

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

export function computeWatchContextScore(watchingWith: WatchContext, watchContexts: string[]): number {
  const normalizedWatchingWith = normalizeName(watchingWith);
  const normalized = new Set(watchContexts.map((value) => normalizeName(value)));
  if (normalized.has(normalizedWatchingWith)) return CONTEXT_MATCH_SCORES.exact;
  const adjacent = WATCH_CONTEXT_ADJACENCY[watchingWith] ?? [];
  const normalizedAdjacent = adjacent.map((context) => normalizeName(context));
  if (normalizedAdjacent.some((context) => normalized.has(context))) return CONTEXT_MATCH_SCORES.adjacent;
  if (watchContexts.length > 0) return CONTEXT_MATCH_SCORES.weak;
  return CONTEXT_MATCH_SCORES.none;
}

export function computeCreatorAffinity(args: {
  preferredDirectors: string[];
  preferredActors: string[];
  movieDirectors: string[];
  movieCast: string[];
}): { score: number; active: boolean } {
  const preferredDirectors = new Set(args.preferredDirectors.map(normalizeName));
  const preferredActors = new Set(args.preferredActors.map(normalizeName));
  const active = preferredDirectors.size > 0 || preferredActors.size > 0;
  if (!active) {
    return { score: 0.5, active: false };
  }

  const directorHits = args.movieDirectors.filter((name) => preferredDirectors.has(normalizeName(name))).length;
  const actorHits = args.movieCast.filter((name) => preferredActors.has(normalizeName(name))).length;
  const directorScore = preferredDirectors.size > 0 ? clamp01(directorHits / preferredDirectors.size) : 0;
  const actorScore = preferredActors.size > 0 ? clamp01(actorHits / preferredActors.size) : 0;

  if (preferredDirectors.size > 0 && preferredActors.size > 0) {
    return { score: directorScore * 0.55 + actorScore * 0.45, active: true };
  }
  return { score: preferredDirectors.size > 0 ? directorScore : actorScore, active: true };
}

export function computeGenrePreference(args: {
  preferredGenres?: string[];
  genrePrimary?: string;
  genreSecondary: string | null;
}): { score: number; active: boolean } {
  const preferredGenres = new Set((args.preferredGenres ?? []).map(normalizeName));
  if (preferredGenres.size === 0 || !args.genrePrimary) {
    return { score: 0.5, active: false };
  }
  const primaryHit = preferredGenres.has(normalizeName(args.genrePrimary));
  const secondaryHit = args.genreSecondary ? preferredGenres.has(normalizeName(args.genreSecondary)) : false;
  if (primaryHit && secondaryHit) return { score: 1, active: true };
  if (primaryHit) return { score: 0.88, active: true };
  if (secondaryHit) return { score: 0.72, active: true };
  return { score: 0.35, active: true };
}

export function computeQualityPrior(reviewScore: number | null): number {
  if (reviewScore == null) return DEFAULT_QUALITY_PRIOR;
  return clamp01(reviewScore / 10);
}

function combineComponents(components: BaseScoreBreakdown["components"]): number {
  const all = Object.values(components);
  const activeWeight = all.reduce((sum, component) => sum + (component.active ? component.weight : 0), 0);
  if (activeWeight <= 0) return 0;
  const weighted = all.reduce((sum, component) => {
    if (!component.active) return sum;
    return sum + component.value * component.weight;
  }, 0);
  return clamp01(weighted / activeWeight);
}

export function scoreBaseRelevance(args: {
  candidateVector: FeatureVector;
  knownTasteVector: FeatureVector | null;
  moodVector: FeatureVector;
  mbtiVector: FeatureVector;
  hasMbtiSignal: boolean;
  watchingWith: WatchContext;
  useFavoritesInRecommendations?: boolean;
  influenceStrength: "light" | "balanced" | "strong";
  preferredGenres?: string[];
  preferredDirectors?: string[];
  preferredActors?: string[];
  candidate: BaseCandidate;
  currentMoods: MoodTag[];
  retrievalSupportScore: number;
}): BaseScoreBreakdown {
  const tasteScore = args.knownTasteVector ? cosineSimilarity(args.knownTasteVector, args.candidateVector) : 0.5;
  const moodScore = cosineSimilarity(args.moodVector, args.candidateVector);
  const mbtiScore = args.hasMbtiSignal ? cosineSimilarity(args.mbtiVector, args.candidateVector) : 0.5;
  const watchContextScore = computeWatchContextScore(args.watchingWith, args.candidate.watchContexts);
  const creatorAffinity = computeCreatorAffinity({
    preferredDirectors: args.preferredDirectors ?? [],
    preferredActors: args.preferredActors ?? [],
    movieDirectors: args.candidate.directors,
    movieCast: args.candidate.cast,
  });
  const genrePreference = computeGenrePreference({
    preferredGenres: args.preferredGenres,
    genrePrimary: args.candidate.genrePrimary,
    genreSecondary: args.candidate.genreSecondary,
  });
  const qualityPriorScore = computeQualityPrior(args.candidate.reviewScore);
  const useFavorites = args.useFavoritesInRecommendations ?? true;
  const influenceMultiplier =
    args.influenceStrength === "light" ? 0.7 : args.influenceStrength === "strong" ? 1.35 : 1;
  const creatorValue = useFavorites ? clamp01(creatorAffinity.score * influenceMultiplier) : 0.5;
  const genreValue = useFavorites ? clamp01(genrePreference.score * influenceMultiplier) : 0.5;

  const components = {
    taste: { value: tasteScore, weight: BASE_SCORE_WEIGHTS.taste, active: Boolean(args.knownTasteVector) },
    mood: { value: moodScore, weight: BASE_SCORE_WEIGHTS.mood, active: args.currentMoods.length > 0 },
    mbti: { value: mbtiScore, weight: BASE_SCORE_WEIGHTS.mbti, active: args.hasMbtiSignal },
    watchContext: { value: watchContextScore, weight: BASE_SCORE_WEIGHTS.watchContext, active: true },
    creatorAffinity: {
      value: creatorValue,
      weight: BASE_SCORE_WEIGHTS.creatorAffinity,
      active: useFavorites && creatorAffinity.active,
    },
    genrePreference: {
      value: genreValue,
      weight: BASE_SCORE_WEIGHTS.genrePreference,
      active: useFavorites && genrePreference.active,
    },
    qualityPrior: { value: qualityPriorScore, weight: BASE_SCORE_WEIGHTS.qualityPrior, active: true },
    retrievalSupport: {
      value: args.retrievalSupportScore,
      weight: BASE_SCORE_WEIGHTS.retrievalSupport,
      active: true,
    },
  } satisfies BaseScoreBreakdown["components"];

  const baseScore = combineComponents(components);

  return {
    tasteScore,
    moodScore,
    mbtiScore,
    watchContextScore,
    creatorAffinityScore: creatorValue,
    genrePreferenceScore: genreValue,
    qualityPriorScore,
    retrievalSupportScore: args.retrievalSupportScore,
    baseScore,
    components,
  };
}
