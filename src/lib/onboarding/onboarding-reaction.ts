export const ONBOARDING_REACTION_TYPES = ["liked", "not_for_me", "dont_know"] as const;

export type OnboardingReactionType = (typeof ONBOARDING_REACTION_TYPES)[number];
