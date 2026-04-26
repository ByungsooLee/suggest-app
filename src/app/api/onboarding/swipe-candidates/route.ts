import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db/prisma";
import { ONBOARDING_MOVIES_V1 } from "@/lib/onboarding/onboarding-movie-list";

const ONBOARDING_MOVIE_COUNT = 14;

export async function GET(request: Request) {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;

  const url = new URL(request.url);
  const fallbackPosterUrl = new URL("/images/no-poster.svg", url.origin).toString();
  const titleYearPairs = ONBOARDING_MOVIES_V1.map((movie) => ({
    title: movie.title,
    releaseYear: movie.releaseYear,
  }));

  const movies = await prisma.movie.findMany({
    where: {
      OR: titleYearPairs.map((movie) => ({
        title: movie.title,
        releaseYear: movie.releaseYear,
      })),
    },
    select: {
      id: true,
      title: true,
      releaseYear: true,
      posterUrl: true,
      overview: true,
      genrePrimary: true,
      genreSecondary: true,
    },
  });

  if (movies.length !== ONBOARDING_MOVIE_COUNT) {
    return Response.json(
      {
        code: "ONBOARDING_MOVIES_MISSING",
        message: "Onboarding movie set is incomplete in catalog. Run seed before onboarding.",
      },
      { status: 409 },
    );
  }

  const movieByKey = new Map(movies.map((movie) => [`${movie.title}::${movie.releaseYear}`, movie]));

  const ordered: Array<{
    movieId: string;
    title: string;
    releaseYear: number | null;
    posterUrl: string;
    overview: string | null;
    genrePrimary: string | null;
    genreSecondary: string | null;
  }> = [];
  for (const movieRef of ONBOARDING_MOVIES_V1) {
    const movie = movieByKey.get(`${movieRef.title}::${movieRef.releaseYear}`);
    if (!movie) continue;
    ordered.push({
      movieId: movie.id,
      title: movie.title,
      releaseYear: movie.releaseYear ?? null,
      posterUrl: movie.posterUrl ?? fallbackPosterUrl,
      overview: movie.overview?.trim() ?? null,
      genrePrimary: movie.genrePrimary,
      genreSecondary: movie.genreSecondary,
    });
  }

  return Response.json({ items: ordered }, { status: 200 });
}
