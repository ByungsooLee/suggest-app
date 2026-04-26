import { type FeatureVector, EMPTY_VECTOR, addVectors, clampVector } from "@/lib/recommendation/feature-vector";

export const USER_MOODS = [
  "want_healing",
  "want_to_be_moved",
  "want_excitement",
  "want_to_laugh",
  "want_tension",
  "want_quiet_immersion",
  "want_to_switch_off",
  "okay_with_something_heavy",
] as const;

export type UserMood = (typeof USER_MOODS)[number];

type MoodDelta = Partial<FeatureVector>;

const asDeltaVector = (delta: MoodDelta): FeatureVector => {
  const vector = { ...EMPTY_VECTOR };
  for (const key of Object.keys(delta) as Array<keyof FeatureVector>) {
    vector[key] = vector[key] + (delta[key] ?? 0) - 0.5;
  }
  return vector;
};

export const USER_MOOD_TARGET_DELTAS: Record<UserMood, MoodDelta> = {
  want_healing: {
    moodCalm: 0.85,
    moodUplifting: 0.75,
    accessibility: 0.7,
    tension: 0.3,
    moodDark: 0.3,
  },
  want_to_be_moved: {
    moodEmotional: 0.85,
    emotionalWeight: 0.8,
    accessibility: 0.6,
  },
  want_excitement: {
    paceFast: 0.8,
    tension: 0.75,
    moodUplifting: 0.65,
  },
  want_to_laugh: {
    toneFunny: 0.85,
    accessibility: 0.75,
    moodDark: 0.35,
  },
  want_tension: {
    tension: 0.85,
    moodDark: 0.7,
    paceFast: 0.6,
  },
  want_quiet_immersion: {
    moodCalm: 0.7,
    paceSlowBurn: 0.7,
    toneStylish: 0.6,
    emotionalWeight: 0.6,
  },
  want_to_switch_off: {
    accessibility: 0.85,
    complexity: 0.2,
    tension: 0.4,
    moodDark: 0.4,
  },
  okay_with_something_heavy: {
    moodDark: 0.7,
    emotionalWeight: 0.75,
    complexity: 0.65,
    tension: 0.6,
  },
};

export function buildMoodVector(mood: UserMood | null | undefined): FeatureVector {
  if (!mood) return { ...EMPTY_VECTOR };
  const delta = USER_MOOD_TARGET_DELTAS[mood];
  return clampVector(addVectors(EMPTY_VECTOR, asDeltaVector(delta)));
}
