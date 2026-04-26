import { type MbtiType } from "@/lib/constants/taxonomy";
import { buildMbtiVector } from "@/lib/onboarding/mbti-map";
import { type FeatureVector } from "@/lib/recommendation/feature-vector";

export function buildMbtiAdjustmentVector(mbti: MbtiType | null | undefined): FeatureVector {
  return buildMbtiVector(mbti);
}
