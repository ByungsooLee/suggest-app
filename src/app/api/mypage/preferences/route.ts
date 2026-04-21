import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db/prisma";
import { parseJson } from "@/lib/validation/http";
import { MyPagePreferencesSchema } from "@/lib/validation/schemas";

export async function GET() {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;

  const user = await prisma.user.findUnique({
    where: { id: authResult.userId },
    select: {
      favoriteGenres: true,
      excludedGenres: true,
      preferredDirectors: true,
      preferredActors: true,
      discoveryMode: true,
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
      },
    },
    { status: 200 },
  );
}

export async function POST(request: Request) {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;

  const parsed = await parseJson(request, MyPagePreferencesSchema);
  if (!parsed.ok) return parsed.response;

  const favoriteSet = new Set(parsed.data.favoriteGenres);
  const overlap = parsed.data.excludedGenres.filter((genre) => favoriteSet.has(genre));
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
    where: { id: authResult.userId },
    data: {
      favoriteGenres: parsed.data.favoriteGenres,
      excludedGenres: parsed.data.excludedGenres,
      preferredDirectors: parsed.data.preferredDirectors,
      preferredActors: parsed.data.preferredActors,
      discoveryMode: parsed.data.discoveryMode,
    },
  });

  return Response.json({ ok: true }, { status: 200 });
}
