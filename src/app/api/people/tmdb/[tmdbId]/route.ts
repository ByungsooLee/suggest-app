import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db/prisma";
import { syncPersonFromTmdbId } from "@/lib/people/person-record";
import { toTmdbProfileImageUrl } from "@/lib/tmdb/client";

export async function GET(_request: Request, context: { params: Promise<{ tmdbId: string }> }) {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;

  const { tmdbId: rawTmdbId } = await context.params;
  const tmdbId = Number.parseInt(rawTmdbId, 10);

  if (!Number.isFinite(tmdbId)) {
    return Response.json({ code: "INVALID_TMDB_ID", message: "tmdbId must be a number." }, { status: 400 });
  }

  const synced = await syncPersonFromTmdbId(tmdbId);
  if (!synced) {
    return Response.json({ code: "NOT_FOUND", message: "TMDB person not found." }, { status: 404 });
  }

  const creditsCount = await prisma.movieCredit.count({
    where: { personId: synced.id },
  });

  return Response.json({
    person: {
      id: synced.id,
      name: synced.name,
      tmdbId: synced.tmdbId,
      avatarUrl: toTmdbProfileImageUrl(synced.profilePath),
      biography: synced.biography,
      knownForDepartment: synced.knownForDepartment,
      creditsCount,
    },
  });
}
