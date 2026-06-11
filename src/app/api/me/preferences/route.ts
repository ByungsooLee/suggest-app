import { getAppUserId } from "@/lib/auth/app-user";
import { prisma } from "@/lib/db/prisma";
import { parseJson } from "@/lib/validation/http";
import { PreferencesPatchSchema } from "@/lib/validation/schemas";

function validateNoGenreOverlap(favoriteGenres: string[], excludedGenres: string[]) {
  const favoriteSet = new Set(favoriteGenres);
  return excludedGenres.filter((genre) => favoriteSet.has(genre));
}

export async function GET() {
  const userId = await getAppUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      favoriteGenres: true,
      excludedGenres: true,
      preferredDirectors: true,
      preferredActors: true,
      discoveryMode: true,
      useFavoritesInRecommendations: true,
      preferenceInfluenceStrength: true,
      recommendationStyleMode: true,
    },
  });

  return Response.json(
    {
      preferences: {
        favoriteGenres: user?.favoriteGenres ?? [],
        excludedGenres: user?.excludedGenres ?? [],
        preferredDirectors: user?.preferredDirectors ?? [],
        preferredActors: user?.preferredActors ?? [],
        discoveryMode: user?.discoveryMode ?? "balanced",
        useFavoritesInRecommendations: user?.useFavoritesInRecommendations ?? true,
        influenceStrength: user?.preferenceInfluenceStrength ?? "balanced",
        recommendationStyleMode: user?.recommendationStyleMode ?? "balanced",
      },
    },
    { status: 200 },
  );
}

export async function PATCH(request: Request) {
  const userId = await getAppUserId();
  const parsed = await parseJson(request, PreferencesPatchSchema);
  if (!parsed.ok) return parsed.response;

  const overlap = validateNoGenreOverlap(parsed.data.favoriteGenres, parsed.data.excludedGenres);
  if (overlap.length > 0) {
    return Response.json(
      {
        code: "INVALID_GENRE_SELECTION",
        message: "favoriteGenres と excludedGenres が重複しています。",
      },
      { status: 422 },
    );
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      favoriteGenres: parsed.data.favoriteGenres,
      excludedGenres: parsed.data.excludedGenres,
      preferredDirectors: parsed.data.preferredDirectors,
      preferredActors: parsed.data.preferredActors,
      discoveryMode: parsed.data.discoveryMode,
      useFavoritesInRecommendations: parsed.data.useFavoritesInRecommendations,
      preferenceInfluenceStrength: parsed.data.influenceStrength,
      recommendationStyleMode: parsed.data.recommendationStyleMode,
    },
  });

  return Response.json({ ok: true }, { status: 200 });
}
