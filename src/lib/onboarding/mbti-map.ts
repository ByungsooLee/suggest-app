import { type MbtiType } from "@/lib/constants/taxonomy";
import { type FeatureVector, EMPTY_VECTOR, clampVector } from "@/lib/recommendation/feature-vector";

type MbtiDelta = Partial<FeatureVector>;

const LETTER_DELTAS: Record<string, MbtiDelta> = {
  I: { moodCalm: 0.08, paceSlowBurn: 0.06, accessibility: -0.02 },
  E: { toneFunny: 0.06, paceFast: 0.06, moodUplifting: 0.05 },
  N: { complexity: 0.08, toneStylish: 0.04 },
  S: { accessibility: 0.08, toneFunny: 0.03 },
  F: { moodEmotional: 0.08, emotionalWeight: 0.07 },
  T: { complexity: 0.08, tension: 0.04 },
  J: { accessibility: 0.04, complexity: 0.03 },
  P: { toneStylish: 0.04, paceSlowBurn: 0.03 },
};

function applyDelta(base: FeatureVector, delta: MbtiDelta): FeatureVector {
  const next = { ...base };
  for (const key of Object.keys(delta) as Array<keyof FeatureVector>) {
    next[key] += delta[key] ?? 0;
  }
  return next;
}

export function buildMbtiVector(mbti: MbtiType | null | undefined): FeatureVector {
  if (!mbti) return { ...EMPTY_VECTOR };
  const letters = mbti.split("");
  let vector = { ...EMPTY_VECTOR };
  for (const letter of letters) {
    const delta = LETTER_DELTAS[letter];
    if (!delta) continue;
    vector = applyDelta(vector, delta);
  }
  return clampVector(vector);
}
