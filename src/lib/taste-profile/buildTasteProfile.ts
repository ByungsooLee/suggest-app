import { type MoodTag } from "@/lib/constants/taxonomy";
import { type Prisma } from "@prisma/client";

type OnboardingInput = {
  favoriteArtists: string[];
  favoriteMovies: string[];
  preferredMoods: MoodTag[];
  dislikedElements: string[];
  mbtiType?: string;
  swipeInsights?: {
    total: number;
    likedCount: number;
    knownCount: number;
    likedGenres: string[];
  };
};

type TasteProfileVector = {
  summary: string;
  moodCalm: number;
  moodDark: number;
  moodEmotional: number;
  toneStylish: number;
  toneFunny: number;
  paceSlowBurn: number;
  complexity: number;
  emotionalWeight: number;
  runtimeToleranceMin: number;
  runtimeToleranceMax: number;
  metadata: Prisma.InputJsonValue;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const mbtiBoostMap: Record<string, { stylish: number; complexity: number; funny: number; dark: number }> = {
  INTJ: { stylish: 0.08, complexity: 0.12, funny: -0.04, dark: 0.08 },
  INTP: { stylish: 0.04, complexity: 0.1, funny: -0.02, dark: 0.05 },
  INFJ: { stylish: 0.06, complexity: 0.07, funny: -0.02, dark: 0.06 },
  INFP: { stylish: 0.03, complexity: 0.06, funny: 0.02, dark: 0.05 },
  ENTJ: { stylish: 0.09, complexity: 0.08, funny: -0.03, dark: 0.04 },
  ENTP: { stylish: 0.05, complexity: 0.09, funny: 0.03, dark: 0.02 },
  ENFJ: { stylish: 0.04, complexity: 0.04, funny: 0.05, dark: -0.01 },
  ENFP: { stylish: 0.02, complexity: 0.03, funny: 0.1, dark: -0.03 },
  ISTJ: { stylish: 0.05, complexity: 0.08, funny: -0.04, dark: 0.04 },
  ISFJ: { stylish: 0.01, complexity: 0.03, funny: 0.02, dark: -0.01 },
  ESTJ: { stylish: 0.04, complexity: 0.06, funny: -0.01, dark: 0.02 },
  ESFJ: { stylish: 0.01, complexity: 0.02, funny: 0.04, dark: -0.02 },
  ISTP: { stylish: 0.06, complexity: 0.05, funny: 0.01, dark: 0.01 },
  ISFP: { stylish: 0.03, complexity: 0.02, funny: 0.03, dark: -0.01 },
  ESTP: { stylish: 0.04, complexity: 0.01, funny: 0.06, dark: -0.02 },
  ESFP: { stylish: 0.02, complexity: -0.01, funny: 0.08, dark: -0.04 },
};

export function buildTasteProfile(input: OnboardingInput): TasteProfileVector {
  const moodSet = new Set(input.preferredMoods);

  const moodCalm = moodSet.has("calm") ? 0.8 : 0.42;
  const moodDark = moodSet.has("dark") || moodSet.has("tense") ? 0.72 : 0.3;
  const moodEmotional = moodSet.has("emotional") || moodSet.has("melancholic") ? 0.82 : 0.48;

  const toneStylish = moodSet.has("stylish") ? 0.8 : 0.5;
  const toneFunny = moodSet.has("funny") || moodSet.has("uplifting") ? 0.76 : 0.35;
  const paceSlowBurn = moodSet.has("stylish") ? 0.62 : 0.42;
  const complexity = input.favoriteMovies.some((m) => m.length > 12) ? 0.58 : 0.4;

  const heavyDislike = input.dislikedElements.some((value) =>
    ["gore", "violence", "disturbing", "too_dark"].includes(value.toLowerCase()),
  );
  const emotionalWeight = heavyDislike ? 0.45 : 0.67;
  const mbtiBoost = input.mbtiType ? mbtiBoostMap[input.mbtiType.toUpperCase()] : undefined;
  const swipe = input.swipeInsights;
  const likedRatio = swipe && swipe.total > 0 ? swipe.likedCount / swipe.total : 0.5;
  const knownRatio = swipe && swipe.total > 0 ? swipe.knownCount / swipe.total : 0.4;

  return {
    summary: `入力された嗜好から、${input.preferredMoods.join("・")}寄りの視聴傾向を推定しました。`,
    moodCalm: clamp01(moodCalm),
    moodDark: clamp01(moodDark + (mbtiBoost?.dark ?? 0)),
    moodEmotional: clamp01(moodEmotional),
    toneStylish: clamp01(toneStylish + (mbtiBoost?.stylish ?? 0) + (knownRatio - 0.4) * 0.1),
    toneFunny: clamp01(toneFunny + (mbtiBoost?.funny ?? 0) + (likedRatio - 0.5) * 0.1),
    paceSlowBurn: clamp01(paceSlowBurn + (knownRatio - 0.4) * 0.08),
    complexity: clamp01(complexity + (mbtiBoost?.complexity ?? 0) + (knownRatio - 0.4) * 0.06),
    emotionalWeight: clamp01(emotionalWeight + (likedRatio - 0.5) * 0.08),
    runtimeToleranceMin: 85,
    runtimeToleranceMax: 150,
    metadata: {
      inferredFrom: {
        favoriteArtists: input.favoriteArtists,
        favoriteMovies: input.favoriteMovies,
      },
      mbtiType: input.mbtiType ?? null,
      swipeInsights: input.swipeInsights ?? null,
      dislikedElements: input.dislikedElements,
    },
  };
}
