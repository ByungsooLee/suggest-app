import { requireUser } from "@/lib/auth/require-user";
import { STREAMING_PROVIDERS } from "@/lib/constants/taxonomy";
import { prisma } from "@/lib/db/prisma";

const providerSet = new Set(STREAMING_PROVIDERS);

export async function GET(request: Request) {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const genre = url.searchParams.get("genre")?.trim() ?? "";
  const director = url.searchParams.get("director")?.trim() ?? "";
  const actor = url.searchParams.get("actor")?.trim() ?? "";
  const provider = url.searchParams.get("provider")?.trim() ?? "";
  const minimumReviewScore = Number(url.searchParams.get("minimumReviewScore") ?? "0");

  if (provider && !providerSet.has(provider as (typeof STREAMING_PROVIDERS)[number])) {
    return Response.json(
      {
        code: "INVALID_PROVIDER",
        message: `provider must be one of: ${STREAMING_PROVIDERS.join(", ")}`,
      },
      { status: 422 },
    );
  }

  const items = await prisma.movie.findMany({
    where: {
      ...(genre ? { OR: [{ genrePrimary: genre }, { genreSecondary: genre }] } : {}),
      ...(Number.isFinite(minimumReviewScore) && minimumReviewScore > 0 ? { reviewScore: { gte: minimumReviewScore } } : {}),
      ...(provider ? { availabilities: { some: { provider } } } : {}),
    },
    include: {
      availabilities: true,
    },
    orderBy: [{ reviewScore: "desc" }, { releaseYear: "desc" }],
    take: 100,
  });

  const normalizedQ = q.toLowerCase();
  const normalizedDirector = director.toLowerCase();
  const normalizedActor = actor.toLowerCase();

  const filtered = items
    .filter((movie) => {
      const byQ =
        !normalizedQ ||
        movie.title.toLowerCase().includes(normalizedQ) ||
        (movie.overview ?? "").toLowerCase().includes(normalizedQ) ||
        movie.cast.some((name) => name.toLowerCase().includes(normalizedQ)) ||
        movie.directors.some((name) => name.toLowerCase().includes(normalizedQ));
      const byDirector = !normalizedDirector || movie.directors.some((name) => name.toLowerCase().includes(normalizedDirector));
      const byActor = !normalizedActor || movie.cast.some((name) => name.toLowerCase().includes(normalizedActor));
      return byQ && byDirector && byActor;
    })
    .slice(0, 20)
    .map((movie) => ({
      id: movie.id,
      title: movie.title,
      releaseYear: movie.releaseYear,
      posterUrl: movie.posterUrl,
      overview: movie.overview,
      directors: movie.directors,
      cast: movie.cast,
      reviewScore: movie.reviewScore,
      reviewSummary: movie.reviewSummary,
      availabilities: movie.availabilities.map((item) => ({
        provider: item.provider,
        region: item.region,
        url: item.url,
      })),
    }));

  return Response.json({ items: filtered }, { status: 200 });
}
