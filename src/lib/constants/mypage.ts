export const WATCH_REACTIONS = ["like", "normal", "dislike"] as const;
export const WATCH_SOURCES = ["netflix", "prime_video", "cinema", "other"] as const;
export const WATCHED_CATALOG_SOURCES = ["manual", "onboarding", "search_add", "quick_classify", "recommendation"] as const;
export const QUICK_REACTION_ACTIONS = ["seen", "not_seen", "liked", "not_for_me", "skip"] as const;
export const INFLUENCE_STRENGTHS = ["light", "balanced", "strong"] as const;
export const RECOMMENDATION_STYLE_MODES = ["safe", "balanced", "discovery_focused"] as const;

export type WatchReaction = (typeof WATCH_REACTIONS)[number];
export type WatchSource = (typeof WATCH_SOURCES)[number];
export type WatchedCatalogSource = (typeof WATCHED_CATALOG_SOURCES)[number];
export type QuickReactionAction = (typeof QUICK_REACTION_ACTIONS)[number];
export type InfluenceStrength = (typeof INFLUENCE_STRENGTHS)[number];
export type RecommendationStyleMode = (typeof RECOMMENDATION_STYLE_MODES)[number];
