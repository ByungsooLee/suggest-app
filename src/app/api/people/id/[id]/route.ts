import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db/prisma";
import { type AppPersonRole, syncPersonFromTmdbId } from "@/lib/people/person-record";
import { toTmdbProfileImageUrl } from "@/lib/tmdb/client";

function isRole(value: string | null): value is AppPersonRole {
  return value === "director" || value === "actor" || value === "writer";
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;

  const { id } = await context.params;
  const roleParam = new URL(request.url).searchParams.get("role");
  const requestedRole = isRole(roleParam) ? roleParam : null;

  const personRecord = await prisma.person.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      tmdbId: true,
      profilePath: true,
      biography: true,
      knownForDepartment: true,
      credits: {
        select: {
          role: true,
          creditOrder: true,
          character: true,
          job: true,
          movie: {
            select: {
              id: true,
              title: true,
              releaseYear: true,
              posterUrl: true,
            },
          },
        },
        orderBy: [{ movie: { releaseYear: "desc" } }, { creditOrder: "asc" }],
        take: 20,
      },
    },
  });

  if (!personRecord) {
    return Response.json({ code: "NOT_FOUND", message: "Person not found." }, { status: 404 });
  }

  const refreshed =
    personRecord.tmdbId && (!personRecord.biography || !personRecord.profilePath)
      ? await syncPersonFromTmdbId(personRecord.tmdbId)
      : null;

  const person = refreshed
    ? {
        ...personRecord,
        profilePath: refreshed.profilePath,
        biography: refreshed.biography,
        knownForDepartment: refreshed.knownForDepartment,
      }
    : personRecord;

  const cache =
    requestedRole
      ? await prisma.personProfileCache.findUnique({
          where: {
            name_role: {
              name: person.name,
              role: requestedRole,
            },
          },
        })
      : null;

  const movieIds = Array.from(new Set(person.credits.map((credit) => credit.movie.id)));
  const collaboratorRows = movieIds.length
    ? await prisma.movieCredit.findMany({
        where: {
          movieId: { in: movieIds },
          personId: { not: person.id },
        },
        select: {
          personId: true,
          role: true,
          movieId: true,
          person: {
            select: {
              id: true,
              name: true,
              tmdbId: true,
              profilePath: true,
            },
          },
        },
      })
    : [];

  const collaborators = [...collaboratorRows.reduce((map, row) => {
    const existing = map.get(row.personId) ?? {
      id: row.person.id,
      name: row.person.name,
      tmdbId: row.person.tmdbId,
      avatarUrl: toTmdbProfileImageUrl(row.person.profilePath),
      collaborationCount: 0,
      roles: new Set<AppPersonRole>(),
    };

    existing.collaborationCount += 1;
    existing.roles.add(row.role as AppPersonRole);
    map.set(row.personId, existing);
    return map;
  }, new Map<string, {
    id: string;
    name: string;
    tmdbId: number | null;
    avatarUrl: string | null;
    collaborationCount: number;
    roles: Set<AppPersonRole>;
  }>()).values()]
    .sort((a, b) => b.collaborationCount - a.collaborationCount)
    .slice(0, 6)
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      tmdbId: entry.tmdbId,
      avatarUrl: entry.avatarUrl,
      collaborationCount: entry.collaborationCount,
      roles: [...entry.roles],
    }));

  return Response.json({
    person: {
      id: person.id,
      name: person.name,
      tmdbId: person.tmdbId,
      avatarUrl: toTmdbProfileImageUrl(person.profilePath) ?? cache?.avatarUrl ?? null,
      biography: person.biography ?? cache?.bio ?? null,
      knownForDepartment: person.knownForDepartment ?? null,
      knownFor:
        cache?.knownFor?.length
          ? cache.knownFor
          : person.credits.slice(0, 4).map((credit) => `${credit.movie.title} (${credit.movie.releaseYear})`),
    },
    credits: person.credits.map((credit) => ({
      movieId: credit.movie.id,
      movieTitle: credit.movie.title,
      releaseYear: credit.movie.releaseYear,
      posterUrl: credit.movie.posterUrl,
      role: credit.role,
      character: credit.character,
      job: credit.job,
    })),
    collaborators,
  });
}
