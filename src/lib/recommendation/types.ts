import { type MbtiType, type Movie } from "@prisma/client";

import { type MoodTag, type WatchContext } from "@/lib/constants/taxonomy";
import { type UserMood } from "@/lib/onboarding/mood-map";
import { type FeatureVector } from "@/lib/recommendation/feature-vector";

export type RecommendationContextInput = {
  desiredRuntimeMin: number;
  desiredRuntimeMax: number;
  excludeContentWarnings: string[];
  excludeTags: string[];
  watchingWith: WatchContext;
  currentMoods: MoodTag[];
  watchedMovieIds: string[];
  useFavoritesInRecommendations: boolean;
  influenceStrength: "light" | "balanced" | "strong";
  recommendationStyleMode: "safe" | "balanced" | "discovery_focused";
  preferredGenres: string[];
  preferredDirectors: string[];
  preferredActors: string[];
  minimumReviewScore?: number;
};

export type ReactionInput = {
  reactionType: "liked" | "not_for_me" | "dont_know";
  signalWeight?: number;
  movie: Pick<
    Movie,
    | "id"
    | "title"
    | "moodCalm"
    | "moodDark"
    | "moodEmotional"
    | "moodUplifting"
    | "toneStylish"
    | "toneFunny"
    | "paceFast"
    | "paceSlowBurn"
    | "complexity"
    | "emotionalWeight"
    | "tension"
    | "accessibility"
  >;
};

export type CandidateMovie = Pick<
  Movie,
  | "id"
  | "title"
  | "genrePrimary"
  | "genreSecondary"
  | "runtimeMinutes"
  | "contentWarnings"
  | "moodTags"
  | "watchContexts"
  | "directors"
  | "cast"
  | "reviewScore"
  | "moodCalm"
  | "moodDark"
  | "moodEmotional"
  | "moodUplifting"
  | "toneStylish"
  | "toneFunny"
  | "paceFast"
  | "paceSlowBurn"
  | "complexity"
  | "emotionalWeight"
  | "tension"
  | "accessibility"
>;

export type RetrievalChannel =
  | "taste_nearest"
  | "mood_compatible"
  | "watch_context"
  | "creator_affinity"
  | "quality_fit"
  | "adjacent_discovery";

export type RetrievalCandidate = {
  movie: CandidateMovie;
  vector: FeatureVector;
  channel: RetrievalChannel;
  channelScore: number;
  channelRank: number;
};

export type RetrievalTrace = {
  channels: RetrievalChannel[];
  bestChannel: RetrievalChannel;
  bestChannelScore: number;
  retrievalSupportScore: number;
};

export type RecentSessionInput = { movieIdsByRank: string[] };

export type RecommendMoviesArgs = {
  movies: CandidateMovie[];
  reactions: ReactionInput[];
  selectedMood: UserMood | null;
  selectedMbti: MbtiType | null;
  recentSessions: RecentSessionInput[];
  contextInput: RecommendationContextInput;
};

export type RecommendationOutput = {
  rank: 1 | 2 | 3;
  movieId: string;
  title: string;
  score: number;
  confidenceLabel: "very_high" | "high" | "medium" | "low";
  reasons: Array<{
    type:
      | "mood_match"
      | "context_match"
      | "runtime_fit"
      | "style_match"
      | "actor_match"
      | "director_match"
      | "genre_match"
      | "review_match";
    text: string;
  }>;
  breakdown: {
    totalScore: number;
    preRerankScore: number;
    baseScore: number;
    noveltyScore: number;
    repetitionPenalty: number;
    knownTasteScore: number;
    currentMoodScore: number;
    mbtiAdjustmentScore: number;
    watchContextScore: number;
    creatorAffinityScore: number;
    genrePreferenceScore: number;
    qualityPriorScore: number;
    adjacentDiscoveryScore: number;
    clonePenaltyReverseScore: number;
    retrievalSupportScore: number;
    retrievalChannelCount: number;
  };
  trace: {
    matchedFeatures: string[];
    strongestComponent:
      | "tasteScore"
      | "moodScore"
      | "mbtiScore"
      | "watchContextScore"
      | "creatorAffinityScore"
      | "genrePreferenceScore"
      | "qualityPriorScore";
    avoidedExclusions: string[];
    retrievalChannels: RetrievalChannel[];
  };
};
