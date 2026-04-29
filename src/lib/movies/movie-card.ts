import type { PersonChipData } from "@/components/person/types";
import { normalizeLocalizedData, type LocalizedData } from "@/lib/i18n/localized-movie";

export type MovieCardPayload = {
  id: string;
  title: string;
  releaseYear: number | null;
  genrePrimary: string | null;
  directors: string[];
  posterUrl: string | null;
  runtimeMinutes: number | null;
  reviewScore: number | null;
  overview: string | null;
  cast: string[];
  credits: PersonChipData[];
  localizedTitles?: unknown;
  localizedData: LocalizedData | null;
};

type MovieCardSource = Omit<MovieCardPayload, "localizedData"> & {
  localizedData?: unknown;
};

export function createMovieCardPayload(movie: MovieCardSource): MovieCardPayload {
  return {
    ...movie,
    localizedData: normalizeLocalizedData(movie.localizedData),
  };
}
