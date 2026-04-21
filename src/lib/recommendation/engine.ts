import { type Movie, type UserTasteProfile } from "@prisma/client";

import { type MoodTag, type WatchContext } from "@/lib/constants/taxonomy";

type ContextInput = {
  currentMoods: MoodTag[];
  desiredRuntimeMin: number;
  desiredRuntimeMax: number;
  watchingWith: WatchContext;
  excludeContentWarnings: string[];
  excludeTags: string[];
};

type ContextVector = {
  moodCalm: number;
  moodDark: number;
  moodEmotional: number;
  desiredRuntimeMin: number;
  desiredRuntimeMax: number;
  watchingWith: WatchContext;
  excludeContentWarnings: Set<string>;
  excludeTags: Set<string>;
};

type ScoreBreakdown = {
  totalScore: number;
  moodMatchScore: number;
  contextMatchScore: number;
  runtimeFitScore: number;
  styleMatchScore: number;
};

export type RecommendationOutput = {
  rank: 1 | 2 | 3;
  movieId: string;
  title: string;
  score: number;
  confidenceLabel: "very_high" | "high" | "medium" | "low";
  reasons: Array<{ type: "mood_match" | "context_match" | "runtime_fit" | "style_match"; text: string }>;
  breakdown: ScoreBreakdown;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const reasonVariants = {
  mood_match: ["今の気分にフィットする空気感です。", "今夜のテンションに寄り添うトーンです。", "気分タグとの一致度が高い候補です。"],
  context_match: ["一緒に観る相手との相性が良いです。", "今の視聴シーンに合う一本です。", "観るメンバーの雰囲気に合わせやすいです。"],
  runtime_fit: ["希望した視聴時間に収まりやすいです。", "今夜の可処分時間にちょうど良い長さです。", "長すぎず短すぎない尺感です。"],
  style_match: ["あなたの好みのスタイルに寄っています。", "映像/語り口が嗜好ベクトルに近いです。", "普段の好みとズレが少ない候補です。"],
} as const;

const fallbackByRank = [
  "総合バランスが最も高く、今夜の本命です。",
  "本命に近い方向性で、気分を外しにくい候補です。",
  "気分転換枠として選びやすいバックアップです。",
] as const;

function pickVariant(type: keyof typeof reasonVariants, seed: number) {
  const variants = reasonVariants[type];
  return variants[seed % variants.length];
}

function seedFromMovie(movie: Movie, rank: number) {
  const titleSum = [...movie.title].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return titleSum + movie.runtimeMinutes + rank * 7;
}

export function toConfidenceLabel(score: number): "very_high" | "high" | "medium" | "low" {
  if (score >= 0.88) return "very_high";
  if (score >= 0.72) return "high";
  if (score >= 0.55) return "medium";
  return "low";
}

export function buildContextVector(input: ContextInput): ContextVector {
  const moodWeights = { calm: 0, dark: 0, emotional: 0 };

  for (const mood of input.currentMoods) {
    if (mood === "calm") moodWeights.calm += 1;
    if (mood === "dark") moodWeights.dark += 1;
    if (mood === "emotional" || mood === "melancholic" || mood === "uplifting") moodWeights.emotional += 1;
  }

  const denominator = input.currentMoods.length || 1;

  return {
    moodCalm: moodWeights.calm / denominator,
    moodDark: moodWeights.dark / denominator,
    moodEmotional: moodWeights.emotional / denominator,
    desiredRuntimeMin: input.desiredRuntimeMin,
    desiredRuntimeMax: input.desiredRuntimeMax,
    watchingWith: input.watchingWith,
    excludeContentWarnings: new Set(input.excludeContentWarnings),
    excludeTags: new Set(input.excludeTags),
  };
}

export function filterMovies(movies: Movie[], context: ContextVector): Movie[] {
  return movies.filter((movie) => {
    if (movie.runtimeMinutes < context.desiredRuntimeMin || movie.runtimeMinutes > context.desiredRuntimeMax) {
      return false;
    }

    if (movie.contentWarnings.some((warning) => context.excludeContentWarnings.has(warning))) {
      return false;
    }

    if (movie.moodTags.some((tag) => context.excludeTags.has(tag))) {
      return false;
    }

    return true;
  });
}

export function scoreMovie(movie: Movie, taste: UserTasteProfile, context: ContextVector): ScoreBreakdown {
  const moodScore =
    1 -
    (Math.abs(movie.moodCalm - (taste.moodCalm + context.moodCalm) / 2) +
      Math.abs(movie.moodDark - (taste.moodDark + context.moodDark) / 2) +
      Math.abs(movie.moodEmotional - (taste.moodEmotional + context.moodEmotional) / 2)) /
      3;

  const contextMatchScore = movie.watchContexts.includes(context.watchingWith) ? 1 : 0.35;

  const targetCenter = (context.desiredRuntimeMin + context.desiredRuntimeMax) / 2;
  const runtimeDistance = Math.abs(movie.runtimeMinutes - targetCenter);
  const runtimeFitScore = clamp01(1 - runtimeDistance / 120);

  const styleDistance =
    Math.abs(movie.toneStylish - taste.toneStylish) +
    Math.abs(movie.toneFunny - taste.toneFunny) +
    Math.abs(movie.paceSlowBurn - taste.paceSlowBurn) +
    Math.abs(movie.complexity - taste.complexity) +
    Math.abs(movie.emotionalWeight - taste.emotionalWeight);
  const styleMatchScore = clamp01(1 - styleDistance / 5);

  const totalScore = clamp01(
    clamp01(moodScore) * 0.38 + contextMatchScore * 0.22 + runtimeFitScore * 0.15 + styleMatchScore * 0.25,
  );

  return {
    totalScore,
    moodMatchScore: clamp01(moodScore),
    contextMatchScore: clamp01(contextMatchScore),
    runtimeFitScore: clamp01(runtimeFitScore),
    styleMatchScore: clamp01(styleMatchScore),
  };
}

export function buildReasons(
  movie: Movie,
  breakdown: ScoreBreakdown,
  context: ContextVector,
  rank: number,
  usedReasonTexts: Set<string>,
): RecommendationOutput["reasons"] {
  const reasons: RecommendationOutput["reasons"] = [];
  const seed = seedFromMovie(movie, rank);

  if (breakdown.moodMatchScore >= 0.7) {
    reasons.push({ type: "mood_match", text: pickVariant("mood_match", seed + 1) });
  }
  if (movie.watchContexts.includes(context.watchingWith)) {
    reasons.push({ type: "context_match", text: pickVariant("context_match", seed + 2) });
  }
  if (breakdown.runtimeFitScore >= 0.75) {
    reasons.push({ type: "runtime_fit", text: pickVariant("runtime_fit", seed + 3) });
  }
  if (breakdown.styleMatchScore >= 0.7) {
    reasons.push({ type: "style_match", text: pickVariant("style_match", seed + 4) });
  }

  if (reasons.length === 0) {
    reasons.push({ type: "mood_match", text: fallbackByRank[Math.min(rank - 1, fallbackByRank.length - 1)] });
  }

  const uniqueReasons: RecommendationOutput["reasons"] = [];
  for (const reason of reasons) {
    if (!usedReasonTexts.has(reason.text)) {
      uniqueReasons.push(reason);
      usedReasonTexts.add(reason.text);
    }
    if (uniqueReasons.length === 3) break;
  }

  if (uniqueReasons.length === 0) {
    uniqueReasons.push({
      type: "mood_match",
      text: fallbackByRank[Math.min(rank - 1, fallbackByRank.length - 1)],
    });
  }

  return uniqueReasons;
}

export function recommendMovies(args: {
  movies: Movie[];
  tasteProfile: UserTasteProfile;
  contextInput: ContextInput;
}): RecommendationOutput[] {
  const context = buildContextVector(args.contextInput);
  const filtered = filterMovies(args.movies, context);
  const usedReasonTexts = new Set<string>();

  return filtered
    .map((movie) => {
      const breakdown = scoreMovie(movie, args.tasteProfile, context);
      return {
        movie,
        breakdown,
      };
    })
    .sort((a, b) => b.breakdown.totalScore - a.breakdown.totalScore)
    .slice(0, 3)
    .map((entry, index) => {
      const rank = (index + 1) as 1 | 2 | 3;
      return {
        rank,
        movieId: entry.movie.id,
        title: entry.movie.title,
        score: entry.breakdown.totalScore,
        confidenceLabel: toConfidenceLabel(entry.breakdown.totalScore),
        reasons: buildReasons(entry.movie, entry.breakdown, context, rank, usedReasonTexts),
        breakdown: entry.breakdown,
      };
    });
}
