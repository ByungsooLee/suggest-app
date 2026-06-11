import { getAppUserId } from "@/lib/auth/app-user";
import { prisma } from "@/lib/db/prisma";
import { parseJson } from "@/lib/validation/http";
import { MeProfilePatchSchema } from "@/lib/validation/schemas";

export async function GET() {
  const userId = await getAppUserId();
  const profile = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      username: true,
      onboardingCompletedAt: true,
    },
  });

  if (!profile) {
    return Response.json({ code: "NOT_FOUND", message: "User not found." }, { status: 404 });
  }

  return Response.json(
    {
      profile: {
        ...profile,
        useFavoritesInRecommendations: true,
        onboardingCompletedAt: profile.onboardingCompletedAt?.toISOString() ?? null,
      },
    },
    { status: 200 },
  );
}

export async function PATCH(request: Request) {
  const userId = await getAppUserId();
  const parsed = await parseJson(request, MeProfilePatchSchema);
  if (!parsed.ok) return parsed.response;

  if (Object.keys(parsed.data).length === 0) {
    return Response.json({ code: "VALIDATION_ERROR", message: "No profile fields provided." }, { status: 422 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      name: parsed.data.name,
      image: parsed.data.image,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      username: true,
      onboardingCompletedAt: true,
    },
  });

  return Response.json(
    {
      profile: {
        ...updated,
        useFavoritesInRecommendations: true,
        onboardingCompletedAt: updated.onboardingCompletedAt?.toISOString() ?? null,
      },
    },
    { status: 200 },
  );
}
