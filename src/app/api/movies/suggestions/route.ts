import { requireUser } from "@/lib/auth/require-user";
import { MOVIE_GENRES } from "@/lib/constants/taxonomy";
import { prisma } from "@/lib/db/prisma";

const genreSet = new Set(MOVIE_GENRES);
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 30;
const curatedFallback = {
  directors: [
    "Christopher Nolan",
    "Denis Villeneuve",
    "Greta Gerwig",
    "Damien Chazelle",
    "David Fincher",
    "Richard Linklater",
    "Wes Anderson",
    "Bong Joon-ho",
  ],
  actors: [
    "Ryan Gosling",
    "Emma Stone",
    "Scarlett Johansson",
    "Jake Gyllenhaal",
    "Amy Adams",
    "Timothee Chalamet",
    "Saoirse Ronan",
    "Tom Cruise",
  ],
};

function isPlaceholderName(value: string) {
  const normalized = value.trim().toLowerCase();
  return (
    normalized === "unknown director" ||
    normalized === "unknown cast a" ||
    normalized === "unknown cast b" ||
    normalized.startsWith("unknown ")
  );
}

function toValidGenres(raw: string | null) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value): value is (typeof MOVIE_GENRES)[number] => genreSet.has(value as (typeof MOVIE_GENRES)[number]));
}

function aggregateNames(values: string[][], limit: number) {
  const counts = new Map<string, number>();
  for (const names of values) {
    for (const name of names) {
      const trimmed = name.trim();
      if (!trimmed || isPlaceholderName(trimmed)) continue;
      counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

function toSuggestionItems(items: Array<{ name: string; count: number }>, role: "director" | "actor") {
  return items.map((item) => ({
    ...item,
    role,
    encodedName: encodeURIComponent(item.name),
  }));
}

export async function GET(request: Request) {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;

  const url = new URL(request.url);
  const genres = toValidGenres(url.searchParams.get("genres"));
  const parsedLimit = Number(url.searchParams.get("limit"));
  const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(Math.floor(parsedLimit), 1), MAX_LIMIT) : DEFAULT_LIMIT;

  const where =
    genres.length > 0
      ? {
          OR: [{ genrePrimary: { in: genres } }, { genreSecondary: { in: genres } }],
        }
      : undefined;

  const movies = await prisma.movie.findMany({
    where,
    select: {
      directors: true,
      cast: true,
    },
    take: 300,
  });

  const fromAllCatalog =
    movies.length === 0
      ? await prisma.movie.findMany({
          select: { directors: true, cast: true },
          take: 300,
        })
      : movies;

  const directors = aggregateNames(
    fromAllCatalog.map((movie) => movie.directors),
    limit,
  );
  const actors = aggregateNames(
    fromAllCatalog.map((movie) => movie.cast),
    limit,
  );
  const finalDirectors =
    directors.length > 0
      ? directors
      : curatedFallback.directors.slice(0, limit).map((name, index) => ({ name, count: Math.max(1, limit - index) }));
  const finalActors =
    actors.length > 0
      ? actors
      : curatedFallback.actors.slice(0, limit).map((name, index) => ({ name, count: Math.max(1, limit - index) }));

  return Response.json(
    {
      genres,
      directors: toSuggestionItems(finalDirectors, "director"),
      actors: toSuggestionItems(finalActors, "actor"),
      fallbackUsed: (movies.length === 0 && genres.length > 0) || directors.length === 0 || actors.length === 0,
    },
    { status: 200 },
  );
}
