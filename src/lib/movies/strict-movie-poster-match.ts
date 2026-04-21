import { searchTmdbMovieByTitleYear, toTmdbPosterUrl } from "@/lib/tmdb/client";

function normalizeText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "")
    .toLowerCase();
}

export async function resolveStrictMoviePoster(args: {
  title: string;
  releaseYear: number;
}): Promise<{
  matched: boolean;
  posterUrl: string | null;
  tmdbMovieId: number | null;
}> {
  const candidates = await searchTmdbMovieByTitleYear(args.title, args.releaseYear);
  const normalizedTitle = normalizeText(args.title);

  for (const candidate of candidates) {
    const candidateTitle = candidate.title ?? candidate.original_title ?? "";
    const titleMatched = normalizeText(candidateTitle) === normalizedTitle;
    if (!titleMatched) continue;

    const yearMatched = (candidate.release_date ?? "").startsWith(String(args.releaseYear));
    if (!yearMatched) continue;

    return {
      matched: true,
      posterUrl: toTmdbPosterUrl(candidate.poster_path),
      tmdbMovieId: candidate.id,
    };
  }

  return {
    matched: false,
    posterUrl: null,
    tmdbMovieId: null,
  };
}
