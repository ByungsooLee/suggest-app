export type MeProfile = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  username?: string | null;
  onboardingCompletedAt: string | null;
  useFavoritesInRecommendations: boolean;
};

export type WatchedContentType = "movie" | "drama";

export type WatchedItem = {
  id: string;
  title: string;
  contentType: WatchedContentType;
  posterUrl: string | null;
  watched: boolean;
  watchedAt: string | null;
  ratingScore: number | null;
  reaction: "like" | "normal" | "dislike" | null;
  watchSource: "netflix" | "prime_video" | "cinema" | "other" | null;
  memo: string | null;
  rewatch: boolean;
  movieId: string | null;
  catalogSource?: "manual" | "onboarding" | "search_add" | "quick_classify" | "recommendation";
  quickConfidence?: number | null;
};

export type Preferences = {
  favoriteGenres: string[];
  excludedGenres: string[];
  preferredDirectors: string[];
  preferredActors: string[];
  discoveryMode: "focused" | "balanced" | "wide";
  useFavoritesInRecommendations: boolean;
  influenceStrength: "light" | "balanced" | "strong";
  recommendationStyleMode: "safe" | "balanced" | "discovery_focused";
};

export type WatchlistItem = {
  id: string;
  title: string;
  contentType: WatchedContentType;
  posterUrl: string | null;
  movieId: string | null;
  note: string | null;
  priority: number | null;
  source: "recommendation" | "manual";
  savedAt: string;
};

export type PersonalStats = {
  totals: {
    watchedCount: number;
    watchlistCount: number;
    moviesCount: number;
    dramasCount: number;
    watchedThisMonth: number;
    averageRating: number | null;
  };
  topGenres: Array<{ name: string; count: number }>;
  topDirectors: Array<{ name: string; count: number }>;
  topActors: Array<{ name: string; count: number }>;
};

export type TasteSummary = {
  summary: string;
  signals: string[];
};

export type RecommendationHistoryItem = {
  id: string;
  sessionId: string;
  movieId: string;
  title: string;
  posterUrl: string | null;
  rank: number;
  recommendedAt: string;
  reasons: string[];
  status: "recommended" | "saved" | "watched" | "skipped";
  savedAt: string | null;
  watchedAt: string | null;
  feedbackReaction: "liked" | "too_dark" | "too_long" | "not_now" | "mismatch" | null;
};

export type SuggestionItem = {
  name: string;
  count: number;
  role: "director" | "actor";
  encodedName: string;
};

export type SuggestionsResponse = {
  genres: string[];
  directors: SuggestionItem[];
  actors: SuggestionItem[];
  fallbackUsed: boolean;
};
