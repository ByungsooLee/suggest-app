import type { RecommendationCandidateRecord } from "@/lib/db/selects/movie";
import { mapCreditsToPersonChipData } from "@/lib/movies/credits";
import type { RecommendationOutput } from "@/lib/recommendation/types";

type RecommendationMovieMap = Map<string, RecommendationCandidateRecord>;

export function buildRecommendationItem(
  item: RecommendationOutput,
  movieById: RecommendationMovieMap,
) {
  const movie = movieById.get(item.movieId);

  return {
    rank: item.rank,
    movieId: item.movieId,
    title: item.title,
    score: item.score,
    confidenceLabel: item.confidenceLabel,
    posterUrl: movie?.posterUrl ?? null,
    overview: movie?.overview ?? null,
    directors: movie?.directors ?? [],
    cast: movie?.cast ?? [],
    credits: mapCreditsToPersonChipData({
      credits: movie?.credits,
      directors: movie?.directors,
      cast: movie?.cast,
    }),
    reviewScore: movie?.reviewScore ?? null,
    reviewSummary: movie?.reviewSummary ?? null,
    reasons: item.reasons,
    debug: {
      baseScore: item.breakdown.baseScore,
      discoveryScore: item.breakdown.noveltyScore,
      repetitionPenalty: item.breakdown.repetitionPenalty,
      retrievalSupportScore: item.breakdown.retrievalSupportScore,
      retrievalChannels: item.trace.retrievalChannels,
    },
  };
}

export function buildRecommendationResponse(
  recommendations: RecommendationOutput[],
  movieById: RecommendationMovieMap,
) {
  const [topPick, ...backups] = recommendations;
  if (!topPick) {
    return {
      topPick: null,
      backups: [],
    };
  }

  return {
    topPick: buildRecommendationItem(topPick, movieById),
    backups: backups.map((item) => buildRecommendationItem(item, movieById)),
  };
}
