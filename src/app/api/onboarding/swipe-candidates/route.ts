import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db/prisma";
import { searchTmdbMovieByTitleYear } from "@/lib/tmdb/client";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 30;
const MIN_OVERVIEW_LENGTH = 120;
const MAX_TMDB_LOOKUPS = 3;
const CATALOG_POOL_SIZE = 160;

function normalizeTitle(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
}

export async function GET(request: Request) {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;

  const url = new URL(request.url);
  const fallbackPosterUrl = new URL("/images/no-poster.svg", url.origin).toString();
  const rawLimit = Number(url.searchParams.get("limit") ?? DEFAULT_LIMIT);
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.floor(rawLimit), 6), MAX_LIMIT) : DEFAULT_LIMIT;

  const movies = await prisma.movie.findMany({
    select: {
      id: true,
      title: true,
      releaseYear: true,
      posterUrl: true,
      overview: true,
      genrePrimary: true,
      genreSecondary: true,
    },
    orderBy: [{ releaseYear: "desc" }, { createdAt: "desc" }],
    take: CATALOG_POOL_SIZE,
  });

  if (movies.length === 0) {
    return Response.json(
      {
        code: "NO_MOVIES",
        message: "Swipe candidates are unavailable because the movie catalog is empty.",
      },
      { status: 404 },
    );
  }

  const sampledMovies = [...movies]
    .map((movie) => ({ movie, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .slice(0, limit)
    .map(({ movie }) => movie);

  const overviewByMovieId = new Map<string, string>();
  const moviesNeedingBackfill = sampledMovies
    .filter((movie) => {
      const overview = movie.overview?.trim() ?? "";
      return overview.length < MIN_OVERVIEW_LENGTH;
    })
    .slice(0, MAX_TMDB_LOOKUPS);

  await Promise.all(
    moviesNeedingBackfill.map(async (movie) => {
      try {
        const results = await searchTmdbMovieByTitleYear(movie.title, movie.releaseYear);
        const normalizedTitle = normalizeTitle(movie.title);
        const strictTitleMatch =
          results.find((item) => normalizeTitle(item.title ?? item.original_title ?? "") === normalizedTitle) ?? results[0];
        const candidateOverview = strictTitleMatch?.overview?.trim();
        if (candidateOverview) {
          overviewByMovieId.set(movie.id, candidateOverview);
        }
      } catch {
        // Ignore TMDB lookup errors to keep onboarding candidates fast and available.
      }
    }),
  );

  const shuffled: Array<{
    movieId: string;
    title: string;
    releaseYear: number | null;
    posterUrl: string;
    overview: string | null;
    genrePrimary: string | null;
    genreSecondary: string | null;
  }> = [];
  for (const movie of sampledMovies) {
    const existingOverview = movie.overview?.trim() ?? null;
    const backfilledOverview = overviewByMovieId.get(movie.id) ?? null;
    const overview =
      backfilledOverview && backfilledOverview.length > (existingOverview?.length ?? 0) ? backfilledOverview : existingOverview;
    shuffled.push({
      movieId: movie.id,
      title: movie.title,
      releaseYear: movie.releaseYear ?? null,
      posterUrl: movie.posterUrl ?? fallbackPosterUrl,
      overview,
      genrePrimary: movie.genrePrimary,
      genreSecondary: movie.genreSecondary,
    });
  }

  return Response.json({ items: shuffled }, { status: 200 });
}
