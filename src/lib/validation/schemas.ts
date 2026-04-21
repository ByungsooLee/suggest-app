import { z } from "zod";

import {
  CONTENT_WARNING_TAGS,
  FEEDBACK_REACTIONS,
  MBTI_TYPES,
  MOVIE_GENRES,
  MOOD_TAGS,
  REVIEW_SOURCES,
  STREAMING_PROVIDERS,
  WATCH_CONTEXTS,
} from "@/lib/constants/taxonomy";

export const MoodTagSchema = z.enum(MOOD_TAGS);
export const WatchContextSchema = z.enum(WATCH_CONTEXTS);
export const ContentWarningSchema = z.enum(CONTENT_WARNING_TAGS);
export const ReactionTypeSchema = z.enum(FEEDBACK_REACTIONS);
export const MovieGenreSchema = z.enum(MOVIE_GENRES);
export const StreamingProviderSchema = z.enum(STREAMING_PROVIDERS);
export const ReviewSourceSchema = z.enum(REVIEW_SOURCES);
export const MbtiSchema = z.enum(MBTI_TYPES);
export const KnownStateSchema = z.enum(["known", "unknown"]);
export const SwipeActionSchema = z.enum(["liked", "skipped"]);
const uniqueNameArray = (max: number) =>
  z
    .array(z.string().trim().min(1))
    .max(max)
    .transform((items) => Array.from(new Set(items.map((item) => item.trim()))));

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
});

export const MeResponseSchema = z.object({
  user: z
    .object({
      id: z.string().min(1),
      name: z.string().nullable(),
      email: z.string().email().nullable(),
      onboardingCompletedAt: z.string().datetime().nullable(),
    })
    .nullable(),
});

export const OnboardingRequestSchema = z.object({
  favoriteArtists: z.array(z.string().trim().min(1)).length(3),
  favoriteMovies: z.array(z.string().trim().min(1)).length(3),
  preferredMoods: z.array(MoodTagSchema).min(1).max(5),
  dislikedElements: z.array(z.string().trim().min(1)).max(10).default([]),
});

export const SwipeEventSchema = z.object({
  movieId: z.string().min(1),
  knownState: KnownStateSchema,
  action: SwipeActionSchema,
  rating: z.number().int().min(1).max(5).nullable().optional(),
  source: z.enum(["onboarding", "recommend", "manual"]).default("onboarding"),
});

export const OnboardingFastPathSchema = z
  .object({
    mbtiType: MbtiSchema,
    preferredMoods: z.array(MoodTagSchema).min(1).max(5),
    swipeEvents: z.array(SwipeEventSchema).min(3).max(60),
    dislikedElements: z.array(z.string().trim().min(1)).max(10).default([]),
    onboardingVersion: z.number().int().min(2).max(10).default(2),
  })
  .superRefine((value, ctx) => {
    const uniqueMovieIds = new Set(value.swipeEvents.map((event) => event.movieId));
    if (uniqueMovieIds.size < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least 3 different movies are required in swipeEvents.",
        path: ["swipeEvents"],
      });
    }
    for (const [index, event] of value.swipeEvents.entries()) {
      if (event.knownState === "known" && (event.rating == null || event.rating < 1 || event.rating > 5)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Known movies must include rating between 1 and 5.",
          path: ["swipeEvents", index, "rating"],
        });
      }
      if (event.knownState === "unknown" && event.rating != null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Unknown movies cannot include rating.",
          path: ["swipeEvents", index, "rating"],
        });
      }
    }
  });

export const OnboardingSubmitSchema = z.union([OnboardingRequestSchema, OnboardingFastPathSchema]);

export const OnboardingResponseSchema = z.object({
  ok: z.literal(true),
  userPreferenceId: z.string().min(1),
  tasteProfileId: z.string().min(1),
});

export const SwipeCandidateItemSchema = z.object({
  movieId: z.string().min(1),
  title: z.string().min(1),
  releaseYear: z.number().int().nullable(),
  posterUrl: z.string().url(),
  overview: z.string().nullable(),
  genrePrimary: MovieGenreSchema.nullable(),
  genreSecondary: MovieGenreSchema.nullable(),
});

export const SwipeCandidatesResponseSchema = z.object({
  items: z.array(SwipeCandidateItemSchema).min(1).max(40),
});

export const SwipeEventsRequestSchema = z.object({
  events: z.array(SwipeEventSchema).min(1).max(30),
});

export const SwipeEventsResponseSchema = z.object({
  ok: z.literal(true),
  savedCount: z.number().int().min(1),
});

export const TasteProfileResponseSchema = z.object({
  profile: z
    .object({
      id: z.string().min(1),
      profileVersion: z.number().int().min(1),
      summary: z.string().min(1),
      moodCalm: z.number().min(0).max(1),
      moodDark: z.number().min(0).max(1),
      moodEmotional: z.number().min(0).max(1),
      toneStylish: z.number().min(0).max(1),
      toneFunny: z.number().min(0).max(1),
      paceSlowBurn: z.number().min(0).max(1),
      complexity: z.number().min(0).max(1),
      emotionalWeight: z.number().min(0).max(1),
      runtimeToleranceMin: z.number().int().min(60).max(240),
      runtimeToleranceMax: z.number().int().min(60).max(240),
    })
    .refine((v) => v.runtimeToleranceMin <= v.runtimeToleranceMax, {
      message: "runtimeToleranceMin must be <= runtimeToleranceMax",
      path: ["runtimeToleranceMax"],
    })
    .nullable(),
});

export const RebuildTasteProfileResponseSchema = z.object({
  ok: z.literal(true),
  tasteProfileId: z.string().min(1),
  profileVersion: z.number().int().min(1),
});

export const RecommendationsRequestSchema = z
  .object({
    currentMoods: z.array(MoodTagSchema).min(1).max(3),
    desiredRuntimeMin: z.number().int().min(60).max(240),
    desiredRuntimeMax: z.number().int().min(60).max(240),
    watchingWith: WatchContextSchema,
    excludeContentWarnings: z.array(ContentWarningSchema).max(10).default([]),
    excludeTags: z.array(z.string().trim().min(1)).max(10).default([]),
    preferredDirectors: uniqueNameArray(10).default([]),
    preferredActors: uniqueNameArray(10).default([]),
    minimumReviewScore: z.number().min(0).max(10).optional(),
  })
  .refine((v) => v.desiredRuntimeMin <= v.desiredRuntimeMax, {
    message: "desiredRuntimeMin must be <= desiredRuntimeMax",
    path: ["desiredRuntimeMax"],
  });

export const RecommendationReasonSchema = z.object({
  type: z.enum(["mood_match", "context_match", "runtime_fit", "style_match", "actor_match", "director_match", "review_match"]),
  text: z.string().min(1).max(120),
});

export const RecommendationItemSchema = z.object({
  rank: z.number().int().min(1).max(3),
  movieId: z.string().min(1),
  title: z.string().min(1),
  score: z.number().min(0).max(1),
  confidenceLabel: z.enum(["very_high", "high", "medium", "low"]),
  posterUrl: z.string().url().nullable().optional(),
  overview: z.string().nullable().optional(),
  directors: z.array(z.string()).optional(),
  cast: z.array(z.string()).optional(),
  reviewScore: z.number().min(0).max(10).nullable().optional(),
  reviewSummary: z.string().nullable().optional(),
  reasons: z.array(RecommendationReasonSchema).min(1).max(3),
});

export const RecommendationsResponseSchema = z.object({
  sessionId: z.string().min(1),
  topPick: RecommendationItemSchema,
  backups: z.array(RecommendationItemSchema).max(2),
});

export const RecommendationSessionResponseSchema = z.object({
  sessionId: z.string().min(1),
  status: z.enum(["completed", "empty"]),
  topPick: RecommendationItemSchema.nullable(),
  backups: z.array(RecommendationItemSchema).max(2),
});

export const FeedbackRequestSchema = z.object({
  sessionId: z.string().min(1),
  recommendationResultId: z.string().min(1).optional(),
  reaction: ReactionTypeSchema,
  comment: z.string().trim().max(240).optional(),
});

export const FeedbackResponseSchema = z.object({
  ok: z.literal(true),
  feedbackId: z.string().min(1),
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

export const MyPagePreferencesSchema = z.object({
  favoriteGenres: z.array(MovieGenreSchema).max(8),
  excludedGenres: z.array(MovieGenreSchema).max(8),
  preferredDirectors: uniqueNameArray(20).default([]),
  preferredActors: uniqueNameArray(20).default([]),
  discoveryMode: DiscoveryModeSchema,
});

export const RankingItemSchema = z.object({
  name: z.string().min(1),
  count: z.number().int().min(1),
});

export const RankingResponseSchema = z.object({
  watchedCount: z.number().int().min(0),
  threshold: z.number().int().min(1),
  unlocked: z.boolean(),
  remainingCount: z.number().int().min(0),
  directors: z.array(RankingItemSchema).max(10),
  actors: z.array(RankingItemSchema).max(10),
});
