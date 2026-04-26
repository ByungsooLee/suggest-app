import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db/prisma";

const PAGE_SIZE = 20;

export async function GET(request: Request) {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const actor = searchParams.get("actor")?.trim().toLowerCase() ?? "";
  const director = searchParams.get("director")?.trim().toLowerCase() ?? "";
  const type = searchParams.get("type");
  const contentType = type === "drama" ? "drama" : "movie";
  const cursorRaw = Number(searchParams.get("cursor") ?? "0");
  const cursor = Number.isFinite(cursorRaw) && cursorRaw >= 0 ? cursorRaw : 0;

  const movies = await prisma.movie.findMany({
    orderBy: [{ reviewScore: "desc" }, { releaseYear: "desc" }, { title: "asc" }],
    skip: cursor,
    take: PAGE_SIZE + 1,
    select: {
      id: true,
      title: true,
      releaseYear: true,
      posterUrl: true,
      overview: true,
      genrePrimary: true,
      directors: true,
      cast: true,
    },
  });

  const filtered = movies.filter((movie) => {
    if (contentType === "drama") {
      if (!["drama", "romance", "mystery"].includes(movie.genrePrimary.toLowerCase())) return false;
    }
    const byQ =
      !q ||
      movie.title.toLowerCase().includes(q) ||
      (movie.overview ?? "").toLowerCase().includes(q) ||
      movie.cast.some((name) => name.toLowerCase().includes(q)) ||
      movie.directors.some((name) => name.toLowerCase().includes(q));
    const byActor = !actor || movie.cast.some((name) => name.toLowerCase().includes(actor));
    const byDirector = !director || movie.directors.some((name) => name.toLowerCase().includes(director));
    return byQ && byActor && byDirector;
  });

  const pageItems = filtered.slice(0, PAGE_SIZE).map((movie) => ({
    id: movie.id,
    title: movie.title,
    releaseYear: movie.releaseYear,
    contentType,
    posterUrl: movie.posterUrl,
    overview: movie.overview,
    directors: movie.directors.slice(0, 6),
    cast: movie.cast.slice(0, 6),
    genrePrimary: movie.genrePrimary,
  }));

  const nextCursor = movies.length > PAGE_SIZE ? String(cursor + PAGE_SIZE) : null;

  return Response.json({ items: pageItems, nextCursor }, { status: 200 });
}
