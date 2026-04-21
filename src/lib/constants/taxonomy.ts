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

export const MOVIE_GENRES = [
  "action",
  "adventure",
  "animation",
  "comedy",
  "crime",
  "drama",
  "family",
  "fantasy",
  "horror",
  "mystery",
  "musical",
  "romance",
  "sci-fi",
  "thriller",
] as const;

export const STREAMING_PROVIDERS = ["netflix", "amazon_prime", "disney_plus", "apple_tv", "hulu"] as const;

export const REVIEW_SOURCES = ["internal_editorial", "tmdb", "imdb", "rottentomatoes"] as const;

export const MBTI_TYPES = [
  "INTJ",
  "INTP",
  "ENTJ",
  "ENTP",
  "INFJ",
  "INFP",
  "ENFJ",
  "ENFP",
  "ISTJ",
  "ISFJ",
  "ESTJ",
  "ESFJ",
  "ISTP",
  "ISFP",
  "ESTP",
  "ESFP",
] as const;

export type MoodTag = (typeof MOOD_TAGS)[number];
export type WatchContext = (typeof WATCH_CONTEXTS)[number];
export type ContentWarningTag = (typeof CONTENT_WARNING_TAGS)[number];
export type StyleTag = (typeof STYLE_TAGS)[number];
export type FeedbackReaction = (typeof FEEDBACK_REACTIONS)[number];
export type MovieGenre = (typeof MOVIE_GENRES)[number];
export type StreamingProvider = (typeof STREAMING_PROVIDERS)[number];
export type ReviewSource = (typeof REVIEW_SOURCES)[number];
export type MbtiType = (typeof MBTI_TYPES)[number];
