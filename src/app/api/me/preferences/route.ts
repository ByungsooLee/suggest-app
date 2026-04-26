import { requireUser } from "@/lib/auth/require-user";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { parseJson } from "@/lib/validation/http";
import { PreferencesPatchSchema } from "@/lib/validation/schemas";

function validateNoGenreOverlap(favoriteGenres: string[], excludedGenres: string[]) {
  const favoriteSet = new Set(favoriteGenres);
  const overlap = excludedGenres.filter((genre) => favoriteSet.has(genre));
  return overlap;
}

export async function GET() {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;

  let user:
    | {
        favoriteGenres: string[];
        excludedGenres: string[];
        preferredDirectors: string[];
        preferredActors: string[];
        discoveryMode: string;
        useFavoritesInRecommendations: boolean;
        preferenceInfluenceStrength: "light" | "balanced" | "strong";
        recommendationStyleMode: "safe" | "balanced" | "discovery_focused";
      }
    | null = null;
  try {
    user = await prisma.user.findUnique({
      where: { id: authResult.userId },
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
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientValidationError)) throw error;
    const legacy = await prisma.user.findUnique({
      where: { id: authResult.userId },
      select: {
        favoriteGenres: true,
        excludedGenres: true,
        preferredDirectors: true,
        preferredActors: true,
        discoveryMode: true,
      },
    });
    user = legacy
      ? {
          ...legacy,
          useFavoritesInRecommendations: true,
          preferenceInfluenceStrength: "balanced",
          recommendationStyleMode: "balanced",
        }
      : null;
  }

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
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;

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

  try {
    await prisma.user.update({
      where: { id: authResult.userId },
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
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientValidationError)) throw error;
    await prisma.user.update({
      where: { id: authResult.userId },
      data: {
        favoriteGenres: parsed.data.favoriteGenres,
        excludedGenres: parsed.data.excludedGenres,
        preferredDirectors: parsed.data.preferredDirectors,
        preferredActors: parsed.data.preferredActors,
        discoveryMode: parsed.data.discoveryMode,
      },
    });
  }

  return Response.json({ ok: true }, { status: 200 });
}
