import { prisma } from "@/lib/db/prisma";
import { getTmdbPersonDetails } from "@/lib/tmdb/client";

export type AppPersonRole = "director" | "actor" | "writer";

export function normalizePersonName(name: string) {
  return name
    .trim()
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export async function syncPersonFromTmdbId(tmdbId: number) {
  const existing = await prisma.person.findUnique({
    where: { tmdbId },
  });

  const details = await getTmdbPersonDetails(tmdbId);
  if (!details.name && !existing) {
    return null;
  }

  const name = details.name ?? existing?.name ?? `tmdb:${tmdbId}`;

  return prisma.person.upsert({
    where: { tmdbId },
    update: {
      name,
      normalizedName: normalizePersonName(name),
      profilePath: details.profilePath ?? existing?.profilePath ?? null,
      biography: details.biography ?? existing?.biography ?? null,
      knownForDepartment: details.knownForDepartment ?? existing?.knownForDepartment ?? null,
      metadata: {
        alsoKnownAs: details.alsoKnownAs,
        syncedAt: new Date().toISOString(),
      },
    },
    create: {
      name,
      normalizedName: normalizePersonName(name),
      tmdbId,
      profilePath: details.profilePath,
      biography: details.biography,
      knownForDepartment: details.knownForDepartment,
      metadata: {
        alsoKnownAs: details.alsoKnownAs,
        syncedAt: new Date().toISOString(),
      },
    },
  });
}
