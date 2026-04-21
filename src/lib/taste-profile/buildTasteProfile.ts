import { type MoodTag } from "@/lib/constants/taxonomy";
import { type Prisma } from "@prisma/client";

type OnboardingInput = {
  favoriteArtists: string[];
  favoriteMovies: string[];
  preferredMoods: MoodTag[];
  dislikedElements: string[];
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

  return {
    summary: `入力された嗜好から、${input.preferredMoods.join("・")}寄りの視聴傾向を推定しました。`,
    moodCalm: clamp01(moodCalm),
    moodDark: clamp01(moodDark),
    moodEmotional: clamp01(moodEmotional),
    toneStylish: clamp01(toneStylish),
    toneFunny: clamp01(toneFunny),
    paceSlowBurn: clamp01(paceSlowBurn),
    complexity: clamp01(complexity),
    emotionalWeight: clamp01(emotionalWeight),
    runtimeToleranceMin: 85,
    runtimeToleranceMax: 150,
    metadata: {
      inferredFrom: {
        favoriteArtists: input.favoriteArtists,
        favoriteMovies: input.favoriteMovies,
      },
      dislikedElements: input.dislikedElements,
    },
  };
}
