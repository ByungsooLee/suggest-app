import { z } from "zod";

import {
  CONTENT_WARNING_TAGS,
  FEEDBACK_REACTIONS,
  MBTI_TYPES,
  MOVIE_GENRE_AXES,
  MOVIE_GENRES,
  MOOD_TAGS,
  REVIEW_SOURCES,
  STREAMING_PROVIDERS,
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
import { PersonRoleSchema } from "@/lib/person/roles";
import { USER_MOODS } from "@/lib/onboarding/mood-map";
import { ONBOARDING_REACTION_TYPES } from "@/lib/onboarding/onboarding-reaction";

export const MoodTagSchema = z.enum(MOOD_TAGS);
export const WatchContextSchema = z.enum(WATCH_CONTEXTS);
export const ContentWarningSchema = z.enum(CONTENT_WARNING_TAGS);
export const ReactionTypeSchema = z.enum(FEEDBACK_REACTIONS);
export const MovieGenreSchema = z.enum(MOVIE_GENRES);
export const MovieGenreAxisSchema = z.enum(MOVIE_GENRE_AXES);
export const StreamingProviderSchema = z.enum(STREAMING_PROVIDERS);
export const ReviewSourceSchema = z.enum(REVIEW_SOURCES);
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
  items: z.array(SwipeCandidateItemSchema).length(14),
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

export const MBTIRecommendContextSchema = z.object({
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

export const RecommendationReasonSchema = z.object({
  type: z.enum(["mood_match", "context_match", "runtime_fit", "style_match", "actor_match", "director_match", "genre_match", "review_match"]),
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
  credits: z.array(z.object({
    personId: z.string().min(1).optional(),
    tmdbId: z.number().int().nullable().optional(),
    name: z.string().min(1),
    role: PersonRoleSchema,
  })).optional(),
  reviewScore: z.number().min(0).max(10).nullable().optional(),
  reviewSummary: z.string().nullable().optional(),
  reasons: z.array(RecommendationReasonSchema).min(1).max(3),
  debug: z
    .object({
      baseScore: z.number().min(0).max(1),
      discoveryScore: z.number().min(0).max(1),
      repetitionPenalty: z.number().min(0).max(1),
      retrievalSupportScore: z.number().min(0).max(1),
      retrievalChannels: z.array(
        z.enum([
          "taste_nearest",
          "mood_compatible",
          "watch_context",
          "creator_affinity",
          "quality_fit",
          "adjacent_discovery",
        ]),
      ),
    })
    .optional(),
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
export const InfluenceStrengthSchema = z.enum(INFLUENCE_STRENGTHS);
export const RecommendationStyleModeSchema = z.enum(RECOMMENDATION_STYLE_MODES);
export const WatchReactionSchema = z.enum(WATCH_REACTIONS);
export const WatchSourceSchema = z.enum(WATCH_SOURCES);
export const WatchedCatalogSourceSchema = z.enum(WATCHED_CATALOG_SOURCES);
export const QuickReactionActionSchema = z.enum(QUICK_REACTION_ACTIONS);

export const MyPagePreferencesSchema = z.object({
  favoriteGenres:          z.array(MovieGenreSchema).max(8),
  excludedGenres:          z.array(MovieGenreSchema).max(8),
  favoriteGenreAxes:       z.array(MovieGenreAxisSchema).max(16).default([]),
  excludedGenreAxes:       z.array(MovieGenreAxisSchema).max(8).default([]),
  preferredDirectors:      uniqueNameArray(20).default([]),
  preferredActors:         uniqueNameArray(20).default([]),
  preferredWriters:        uniqueNameArray(20).default([]),
  discoveryMode:           DiscoveryModeSchema,
  influenceStrength:       InfluenceStrengthSchema.default("balanced"),
  recommendationStyleMode: RecommendationStyleModeSchema.default("balanced"),
});

export type MyPagePreferences = z.infer<typeof MyPagePreferencesSchema>;

export const UseFavoritesInRecommendationsSchema = z.boolean();

export const MeProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().nullable(),
  email: z.string().email().nullable(),
  image: z.string().nullable(),
  username: z.string().nullable().optional(),
  onboardingCompletedAt: z.string().datetime().nullable(),
  useFavoritesInRecommendations: z.boolean(),
});

export const MeProfileResponseSchema = z.object({
  profile: MeProfileSchema,
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

export const WatchedItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  contentType: WatchedContentTypeSchema,
  posterUrl: z.string().nullable(),
  watched: z.boolean(),
  watchedAt: z.string().datetime().nullable(),
  ratingScore: z.number().int().min(1).max(5).nullable(),
  reaction: WatchReactionSchema.nullable(),
  watchSource: WatchSourceSchema.nullable(),
  memo: z.string().nullable(),
  rewatch: z.boolean(),
  movieId: z.string().nullable(),
  catalogSource: WatchedCatalogSourceSchema.optional(),
  quickConfidence: z.number().int().min(1).max(100).nullable().optional(),
});

export const WatchedListResponseSchema = z.object({
  items: z.array(WatchedItemSchema),
});

export const WatchedListQuerySchema = z.object({
  type: WatchedContentTypeSchema.or(z.literal("all")).default("all"),
});

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

export const WatchedCreateResponseSchema = z.object({
  item: WatchedItemSchema,
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

export const WatchedSortSchema = z.enum(["recently_added", "watched_date", "reaction", "release_year"]);

export const LibrarySearchCandidateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  releaseYear: z.number().int().nullable(),
  contentType: WatchedContentTypeSchema,
  posterUrl: z.string().nullable(),
  overview: z.string().nullable(),
  directors: z.array(z.string()).max(6),
  cast: z.array(z.string()).max(6),
  genrePrimary: z.string().nullable(),
});

export const LibrarySearchCandidatesResponseSchema = z.object({
  items: z.array(LibrarySearchCandidateSchema),
  nextCursor: z.string().nullable(),
});

export const QuickCandidateSchema = z.object({
  movieId: z.string().min(1),
  title: z.string().min(1),
  releaseYear: z.number().int().nullable(),
  posterUrl: z.string().nullable(),
  overview: z.string().nullable(),
  directors: z.array(z.string()).max(4),
  cast: z.array(z.string()).max(4),
  genrePrimary: z.string().nullable(),
  strategyBucket: z.enum(["anchor", "genre_diverse", "era_diverse", "taste_adjacent", "boundary_test", "exploratory"]),
});

export const QuickCandidatesResponseSchema = z.object({
  items: z.array(QuickCandidateSchema),
  strategyMeta: z.object({
    servedCount: z.number().int().min(0),
    excludedCount: z.number().int().min(0),
  }),
  nextCursor: z.string().nullable(),
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

export const QuickReactionSubmitResponseSchema = z.object({
  savedCount: z.number().int().min(0),
  upsertedLibraryCount: z.number().int().min(0),
});

export const LibraryStatsResponseSchema = z.object({
  totals: z.object({
    watchedCount: z.number().int().min(0),
    movieCount: z.number().int().min(0),
    dramaCount: z.number().int().min(0),
  }),
  reactions: z.object({
    like: z.number().int().min(0),
    normal: z.number().int().min(0),
    dislike: z.number().int().min(0),
  }),
  recentQuickReactions: z.number().int().min(0),
});

export const PreferencesResponseSchema = z.object({
  preferences: MyPagePreferencesSchema.extend({
    useFavoritesInRecommendations: UseFavoritesInRecommendationsSchema,
  }),
});

export const PreferencesPatchSchema = MyPagePreferencesSchema.extend({
  useFavoritesInRecommendations: UseFavoritesInRecommendationsSchema,
});

export const WatchlistItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  contentType: WatchedContentTypeSchema,
  posterUrl: z.string().nullable(),
  movieId: z.string().nullable(),
  note: z.string().nullable(),
  priority: z.number().int().min(1).max(5).nullable(),
  source: z.enum(["recommendation", "manual"]),
  savedAt: z.string().datetime(),
});

export const WatchlistListResponseSchema = z.object({
  items: z.array(WatchlistItemSchema),
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

export const StatsResponseSchema = z.object({
  totals: z.object({
    watchedCount: z.number().int().min(0),
    watchlistCount: z.number().int().min(0),
    moviesCount: z.number().int().min(0),
    dramasCount: z.number().int().min(0),
    watchedThisMonth: z.number().int().min(0),
    averageRating: z.number().min(0).max(5).nullable(),
  }),
  topGenres: z.array(z.object({ name: z.string(), count: z.number().int().min(1) })).max(5),
  topDirectors: z.array(z.object({ name: z.string(), count: z.number().int().min(1) })).max(5),
  topActors: z.array(z.object({ name: z.string(), count: z.number().int().min(1) })).max(5),
});

export const TasteSummaryResponseSchema = z.object({
  summary: z.string().min(1),
  signals: z.array(z.string()).max(6),
});

export const RecommendationHistoryStatusSchema = z.enum(["recommended", "saved", "watched", "skipped"]);

export const RecommendationHistoryItemSchema = z.object({
  id: z.string().min(1),
  sessionId: z.string().min(1),
  movieId: z.string().min(1),
  title: z.string().min(1),
  posterUrl: z.string().nullable(),
  rank: z.number().int().min(1),
  recommendedAt: z.string().datetime(),
  reasons: z.array(z.string().min(1).max(120)).max(3),
  status: RecommendationHistoryStatusSchema,
  savedAt: z.string().datetime().nullable(),
  watchedAt: z.string().datetime().nullable(),
  feedbackReaction: ReactionTypeSchema.nullable(),
});

export const RecommendationHistoryResponseSchema = z.object({
  items: z.array(RecommendationHistoryItemSchema).max(120),
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
