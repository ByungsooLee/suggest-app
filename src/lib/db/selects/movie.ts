import { Prisma } from "@prisma/client";

export const movieCreditsSelect = Prisma.validator<Prisma.MovieCreditFindManyArgs>()({
  select: {
    role: true,
    creditOrder: true,
    person: {
      select: {
        id: true,
        name: true,
        tmdbId: true,
      },
    },
  },
  orderBy: [{ role: "asc" }, { creditOrder: "asc" }],
});

export const movieCardSelect = Prisma.validator<Prisma.MovieSelect>()({
  id: true,
  title: true,
  releaseYear: true,
  genrePrimary: true,
  directors: true,
  posterUrl: true,
  runtimeMinutes: true,
  reviewScore: true,
  overview: true,
  cast: true,
  localizedTitles: true,
  localizedData: true,
  credits: movieCreditsSelect,
});

export const recommendationCandidateSelect = Prisma.validator<Prisma.MovieSelect>()({
  ...movieCardSelect,
  genreSecondary: true,
  contentWarnings: true,
  moodTags: true,
  watchContexts: true,
  reviewSummary: true,
  moodCalm: true,
  moodDark: true,
  moodEmotional: true,
  moodUplifting: true,
  toneStylish: true,
  toneFunny: true,
  paceFast: true,
  paceSlowBurn: true,
  complexity: true,
  emotionalWeight: true,
  tension: true,
  accessibility: true,
});

export const movieDetailSelect = Prisma.validator<Prisma.MovieSelect>()({
  id: true,
  title: true,
  releaseYear: true,
  runtimeMinutes: true,
  genrePrimary: true,
  genreSecondary: true,
  posterUrl: true,
  overview: true,
  directors: true,
  cast: true,
  reviewScore: true,
  reviewSummary: true,
  moodCalm: true,
  moodDark: true,
  moodEmotional: true,
  toneStylish: true,
  tension: true,
  complexity: true,
  moodTags: true,
  localizedData: true,
  credits: movieCreditsSelect,
});

export type MovieCardRecord = Prisma.MovieGetPayload<{ select: typeof movieCardSelect }>;
export type RecommendationCandidateRecord = Prisma.MovieGetPayload<{ select: typeof recommendationCandidateSelect }>;
export type MovieDetailRecord = Prisma.MovieGetPayload<{ select: typeof movieDetailSelect }>;
