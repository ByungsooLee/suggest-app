import { z } from "zod";

import {
  CONTENT_WARNING_TAGS,
  FEEDBACK_REACTIONS,
  MOOD_TAGS,
  WATCH_CONTEXTS,
} from "@/lib/constants/taxonomy";

export const MoodTagSchema = z.enum(MOOD_TAGS);
export const WatchContextSchema = z.enum(WATCH_CONTEXTS);
export const ContentWarningSchema = z.enum(CONTENT_WARNING_TAGS);
export const ReactionTypeSchema = z.enum(FEEDBACK_REACTIONS);

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

export const OnboardingResponseSchema = z.object({
  ok: z.literal(true),
  userPreferenceId: z.string().min(1),
  tasteProfileId: z.string().min(1),
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
  })
  .refine((v) => v.desiredRuntimeMin <= v.desiredRuntimeMax, {
    message: "desiredRuntimeMin must be <= desiredRuntimeMax",
    path: ["desiredRuntimeMax"],
  });

export const RecommendationReasonSchema = z.object({
  type: z.enum(["mood_match", "context_match", "runtime_fit", "style_match"]),
  text: z.string().min(1).max(120),
});

export const RecommendationItemSchema = z.object({
  rank: z.number().int().min(1).max(3),
  movieId: z.string().min(1),
  title: z.string().min(1),
  score: z.number().min(0).max(1),
  confidenceLabel: z.enum(["very_high", "high", "medium", "low"]),
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
