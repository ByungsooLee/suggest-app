import { type MoodTag } from "@/lib/constants/taxonomy";
import { type UserMood, buildMoodVector } from "@/lib/onboarding/mood-map";
import {
  type FeatureVector,
  EMPTY_VECTOR,
  addVectors,
  clampVector,
  scaleVector,
  subtractVectors,
} from "@/lib/recommendation/feature-vector";

function vectorFromTargets(targets: Partial<FeatureVector>): FeatureVector {
  const vector = { ...EMPTY_VECTOR };
  for (const [key, value] of Object.entries(targets) as Array<[keyof FeatureVector, number]>) {
    vector[key] = value;
  }
  return vector;
}

const MOOD_TAG_TO_VECTOR: Record<MoodTag, FeatureVector> = {
  calm: vectorFromTargets({ moodCalm: 0.9, tension: 0.3, paceSlowBurn: 0.62 }),
  emotional: vectorFromTargets({ moodEmotional: 0.88, emotionalWeight: 0.82, moodUplifting: 0.56 }),
  stylish: vectorFromTargets({ toneStylish: 0.9, complexity: 0.62 }),
  dark: vectorFromTargets({ moodDark: 0.9, tension: 0.72, accessibility: 0.4 }),
  funny: vectorFromTargets({ toneFunny: 0.9, moodUplifting: 0.72, accessibility: 0.8 }),
  tense: vectorFromTargets({ tension: 0.92, paceFast: 0.78, moodDark: 0.68 }),
  uplifting: vectorFromTargets({ moodUplifting: 0.92, accessibility: 0.8, moodDark: 0.35 }),
  melancholic: vectorFromTargets({ moodEmotional: 0.78, moodDark: 0.62, paceSlowBurn: 0.66 }),
};

function blendMoodTags(currentMoods: MoodTag[]): FeatureVector {
  if (currentMoods.length === 0) return { ...EMPTY_VECTOR };
  const totalWeight = currentMoods.reduce((sum, _mood, idx) => sum + (idx === 0 ? 1.2 : 1), 0);
  let deltaAccumulator = subtractVectors(EMPTY_VECTOR, EMPTY_VECTOR);
  for (const [index, mood] of currentMoods.entries()) {
    const weight = (index === 0 ? 1.2 : 1) / totalWeight;
    const moodDelta = subtractVectors(MOOD_TAG_TO_VECTOR[mood], EMPTY_VECTOR);
    deltaAccumulator = addVectors(deltaAccumulator, scaleVector(moodDelta, weight));
  }
  return clampVector(addVectors(EMPTY_VECTOR, deltaAccumulator));
}

export function buildContextVector(args: {
  selectedMood: UserMood | null | undefined;
  currentMoods: MoodTag[];
}): FeatureVector {
  const currentMoodVector = blendMoodTags(args.currentMoods);
  if (args.currentMoods.length === 0) {
    return buildMoodVector(args.selectedMood);
  }
  if (!args.selectedMood) {
    return currentMoodVector;
  }
  const onboardingMoodVector = buildMoodVector(args.selectedMood);
  const currentDelta = subtractVectors(currentMoodVector, EMPTY_VECTOR);
  const onboardingDelta = subtractVectors(onboardingMoodVector, EMPTY_VECTOR);
  return clampVector(
    addVectors(
      EMPTY_VECTOR,
      addVectors(
        scaleVector(currentDelta, 0.75),
        scaleVector(onboardingDelta, 0.25),
      ),
    ),
  );
}
