import { z } from "zod";

import {
  CONTENT_WARNING_TAGS,
  MBTI_TYPES,
  MOVIE_GENRE_AXES,
  MOVIE_GENRES,
  MOOD_TAGS,
  WATCH_CONTEXTS,
} from "@/lib/constants/taxonomy";
import {
  INFLUENCE_STRENGTHS,
  QUICK_REACTION_ACTIONS,
  RECOMMENDATION_STYLE_MODES,
  WATCH_REACTIONS,
  WATCH_SOURCES,
  WATCHED_CATALOG_SOURCES,
} from "@/lib/constants/mypage";
import { USER_MOODS } from "@/lib/onboarding/mood-map";
import { ONBOARDING_REACTION_TYPES } from "@/lib/onboarding/onboarding-reaction";

export const MoodTagSchema = z.enum(MOOD_TAGS);
export const WatchContextSchema = z.enum(WATCH_CONTEXTS);
export const ContentWarningSchema = z.enum(CONTENT_WARNING_TAGS);
export const MovieGenreSchema = z.enum(MOVIE_GENRES);
export const MovieGenreAxisSchema = z.enum(MOVIE_GENRE_AXES);
export const MbtiSchema = z.enum(MBTI_TYPES);
export const UserMoodSchema = z.enum(USER_MOODS);
export const OnboardingReactionTypeSchema = z.enum(ONBOARDING_REACTION_TYPES);
export const KnownStateSchema = z.enum(["known", "unknown"]);
export const SwipeActionSchema = z.enum(["liked", "skipped"]);

const uniqueNameArray = (max: number) =>
  z
    .array(z.string().trim().min(1))
    .max(max)
    .transform((items) => Array.from(new Set(items.map((item) => item.trim()))));

export const OnboardingMovieReactionInputSchema = z.object({
  movieId: z.string().min(1),
  reactionType: OnboardingReactionTypeSchema,
});

export const SwipeEventSchema = z.object({
  movieId: z.string().min(1),
  knownState: KnownStateSchema,
  action: SwipeActionSchema,
  rating: z.number().int().min(1).max(5).nullable().optional(),
  source: z.enum(["onboarding", "recommend", "manual"]).default("onboarding"),
});

export const OnboardingSubmitSchema = z
  .object({
    mbtiType: MbtiSchema,
    selectedMood: UserMoodSchema,
    reactions: z.array(OnboardingMovieReactionInputSchema).length(14),
    onboardingVersion: z.number().int().min(1).max(10).default(1),
  })
  .superRefine((value, ctx) => {
    const uniqueMovieIds = new Set(value.reactions.map((reaction) => reaction.movieId));
    if (uniqueMovieIds.size !== 14) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Exactly 14 unique onboarding reactions are required.",
        path: ["reactions"],
      });
    }
  });

export const SwipeEventsRequestSchema = z.object({
  events: z.array(SwipeEventSchema).min(1).max(30),
});

const MBTIRecommendContextSchema = z.object({
  types: z.array(z.string().min(4).max(4)).min(2).max(6),
  score: z.number().int().min(1).max(5),
  chemistry: z.string().max(200),
  movieGenres: z.array(z.string().max(40)).max(8),
  decisionHook: z.string().max(200),
  exampleMovies: z.array(z.string().max(100)).max(5),
  watchingWith: z.enum(["pair", "group"]),
});

export const RecommendationsRequestSchema = z
  .object({
    currentMoods: z.array(MoodTagSchema).min(1).max(3),
    desiredRuntimeMin: z.number().int().min(60).max(240),
    desiredRuntimeMax: z.number().int().min(60).max(240),
    watchingWith: WatchContextSchema,
    excludeContentWarnings: z.array(ContentWarningSchema).max(10).default([]),
    excludeTags: z.array(z.string().trim().min(1)).max(10).default([]),
    preferredGenres: z.array(MovieGenreSchema).max(8).default([]),
    preferredDirectors: uniqueNameArray(10).default([]),
    preferredActors: uniqueNameArray(10).default([]),
    minimumReviewScore: z.number().min(0).max(10).optional(),
    mbtiContext: MBTIRecommendContextSchema.optional(),
  })
  .refine((v) => v.desiredRuntimeMin <= v.desiredRuntimeMax, {
    message: "desiredRuntimeMin must be <= desiredRuntimeMax",
    path: ["desiredRuntimeMax"],
  });

export const PersonNewsItemSchema = z.object({
  title: z.string().min(1),
  source: z.string().min(1),
  publishedAt: z.string().datetime(),
  url: z.string().url().nullable(),
});

export const PersonPreviewSchema = z.object({
  name: z.string().min(1),
  role: z.enum(["director", "actor"]),
  avatarUrl: z.string().url().nullable(),
  bio: z.string().nullable(),
  knownFor: z.array(z.string()).max(10),
  news: z.array(PersonNewsItemSchema).max(5),
  strictMatched: z.boolean().optional(),
  matchStatus: z.enum(["verified", "unverified"]).optional(),
  matchConfidence: z.number().min(0).max(1).nullable().optional(),
  matchReason: z.string().nullable().optional(),
  matchEvidence: z.unknown().nullable().optional(),
  externalSource: z.string().nullable().optional(),
  externalPersonId: z.number().int().nullable().optional(),
  cached: z.boolean().optional(),
  lastSyncedAt: z.string().datetime().nullable().optional(),
});

export const DiscoveryModeSchema = z.enum(["focused", "balanced", "wide"]);
export const InfluenceStrengthSchema = z.enum(INFLUENCE_STRENGTHS);
export const RecommendationStyleModeSchema = z.enum(RECOMMENDATION_STYLE_MODES);
export const WatchReactionSchema = z.enum(WATCH_REACTIONS);
export const WatchSourceSchema = z.enum(WATCH_SOURCES);
export const WatchedCatalogSourceSchema = z.enum(WATCHED_CATALOG_SOURCES);
export const QuickReactionActionSchema = z.enum(QUICK_REACTION_ACTIONS);

const MyPagePreferencesSchema = z.object({
  favoriteGenres: z.array(MovieGenreSchema).max(8),
  excludedGenres: z.array(MovieGenreSchema).max(8),
  favoriteGenreAxes: z.array(MovieGenreAxisSchema).max(16).default([]),
  excludedGenreAxes: z.array(MovieGenreAxisSchema).max(8).default([]),
  preferredDirectors: uniqueNameArray(20).default([]),
  preferredActors: uniqueNameArray(20).default([]),
  preferredWriters: uniqueNameArray(20).default([]),
  discoveryMode: DiscoveryModeSchema,
  influenceStrength: InfluenceStrengthSchema.default("balanced"),
  recommendationStyleMode: RecommendationStyleModeSchema.default("balanced"),
});

export const PreferencesPatchSchema = MyPagePreferencesSchema.extend({
  useFavoritesInRecommendations: z.boolean(),
});

export const MeProfilePatchSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  image: z
    .string()
    .trim()
    .min(1)
    .max(1024)
    .regex(/^data:image\/[a-zA-Z0-9.+-]+;base64,|^https?:\/\//, "image must be data URL or http(s) URL")
    .optional(),
});

export const WatchedContentTypeSchema = z.enum(["movie", "drama"]);

export const WatchedCreateSchema = z
  .object({
    contentType: WatchedContentTypeSchema,
    movieId: z.string().min(1).optional(),
    title: z.string().trim().min(1).max(140).optional(),
    posterUrl: z.string().trim().max(1024).optional(),
    watched: z.boolean().default(true),
    watchedAt: z.string().datetime().optional(),
    ratingScore: z.number().int().min(1).max(5).optional(),
    reaction: WatchReactionSchema.optional(),
    watchSource: WatchSourceSchema.optional(),
    memo: z.string().trim().max(240).optional(),
    rewatch: z.boolean().default(false),
    catalogSource: WatchedCatalogSourceSchema.default("manual"),
    quickConfidence: z.number().int().min(1).max(100).optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.movieId && !value.title) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["title"],
        message: "title is required when movieId is not provided.",
      });
    }
  });

export const WatchedPatchSchema = z.object({
  watchedAt: z.string().datetime().nullable().optional(),
  ratingScore: z.number().int().min(1).max(5).nullable().optional(),
  reaction: WatchReactionSchema.nullable().optional(),
  watchSource: WatchSourceSchema.nullable().optional(),
  memo: z.string().trim().max(240).nullable().optional(),
  rewatch: z.boolean().optional(),
  watched: z.boolean().optional(),
});

export const QuickReactionEventSchema = z.object({
  movieId: z.string().min(1),
  action: QuickReactionActionSchema,
  shownAt: z.string().datetime(),
  sessionToken: z.string().trim().min(1).max(120).optional(),
});

export const QuickReactionSubmitSchema = z.object({
  events: z.array(QuickReactionEventSchema).min(1).max(30),
});

export const WatchlistCreateSchema = z
  .object({
    contentType: WatchedContentTypeSchema.default("movie"),
    movieId: z.string().min(1).optional(),
    title: z.string().trim().min(1).max(140).optional(),
    posterUrl: z.string().trim().max(1024).optional(),
    note: z.string().trim().max(240).optional(),
    priority: z.number().int().min(1).max(5).optional(),
    source: z.enum(["recommendation", "manual"]).default("manual"),
    recommendedFromResultId: z.string().min(1).optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.movieId && !value.title) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["title"],
        message: "title is required when movieId is not provided.",
      });
    }
  });

export const WatchlistPatchSchema = z.object({
  note: z.string().trim().max(240).nullable().optional(),
  priority: z.number().int().min(1).max(5).nullable().optional(),
});

export const MoveWatchlistToWatchedSchema = z.object({
  watchedAt: z.string().datetime().optional(),
  ratingScore: z.number().int().min(1).max(5).optional(),
  reaction: WatchReactionSchema.optional(),
  watchSource: WatchSourceSchema.optional(),
  memo: z.string().trim().max(240).optional(),
  rewatch: z.boolean().default(false),
});
