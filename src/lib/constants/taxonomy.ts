export const MOOD_TAGS = [
  "calm",
  "emotional",
  "stylish",
  "dark",
  "funny",
  "tense",
  "uplifting",
  "melancholic",
] as const;

export const WATCH_CONTEXTS = [
  "solo_watch",
  "date_friendly",
  "friends_hangout",
  "family_time",
  "late_night_fit",
] as const;

export const CONTENT_WARNING_TAGS = [
  "gore",
  "sad_ending",
  "violence",
  "disturbing",
] as const;

export const STYLE_TAGS = ["easy_to_watch", "slow_burn", "complex_plot", "visual_masterpiece"] as const;

export const FEEDBACK_REACTIONS = ["liked", "too_dark", "too_long", "not_now", "mismatch"] as const;

export type MoodTag = (typeof MOOD_TAGS)[number];
export type WatchContext = (typeof WATCH_CONTEXTS)[number];
export type ContentWarningTag = (typeof CONTENT_WARNING_TAGS)[number];
export type StyleTag = (typeof STYLE_TAGS)[number];
export type FeedbackReaction = (typeof FEEDBACK_REACTIONS)[number];
