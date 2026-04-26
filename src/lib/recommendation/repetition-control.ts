import { REPETITION_CONTROL } from "@/lib/recommendation/constants";
import { clamp01 } from "@/lib/recommendation/feature-vector";

export type RecentRecommendation = {
  movieId: string;
  rank: 1 | 2 | 3;
  sessionIndex: number;
};

export function buildRecentRecommendationIndex(
  sessions: Array<{ movieIdsByRank: string[] }>,
): RecentRecommendation[] {
  return sessions.slice(0, REPETITION_CONTROL.maxSessions).flatMap((session, sessionIndex) =>
    session.movieIdsByRank.slice(0, 3).map((movieId, index) => ({
      movieId,
      rank: (index + 1) as 1 | 2 | 3,
      sessionIndex,
    })),
  );
}

export function computeRepetitionPenalty(args: {
  movieId: string;
  recentRecommendations: RecentRecommendation[];
  globalExposurePenalty?: number;
}): number {
  let userCooldownPenalty = 0;
  for (const entry of args.recentRecommendations) {
    if (entry.movieId !== args.movieId) continue;
    const rankPenalty = REPETITION_CONTROL.rankPenalty[entry.rank];
    const decay = Math.pow(REPETITION_CONTROL.sessionDecay, entry.sessionIndex);
    userCooldownPenalty += rankPenalty * decay;
  }
  const normalizedUserPenalty = clamp01(userCooldownPenalty);
  const globalExposurePenalty = clamp01(args.globalExposurePenalty ?? 0);
  return clamp01(
    normalizedUserPenalty * REPETITION_CONTROL.userCooldownWeight +
      globalExposurePenalty * REPETITION_CONTROL.globalExposureWeight,
  );
}
