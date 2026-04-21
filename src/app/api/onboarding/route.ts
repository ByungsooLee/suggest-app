import { buildTasteProfile } from "@/lib/taste-profile/buildTasteProfile";
import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db/prisma";
import { parseJson } from "@/lib/validation/http";
import { OnboardingRequestSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;

  const parsed = await parseJson(request, OnboardingRequestSchema);
  if (!parsed.ok) return parsed.response;

  const result = await prisma.$transaction(async (tx) => {
    const preference = await tx.userPreference.create({
      data: {
        userId: authResult.userId,
        favoriteArtists: parsed.data.favoriteArtists,
        favoriteMovies: parsed.data.favoriteMovies,
        preferredMoods: parsed.data.preferredMoods,
        dislikedElements: parsed.data.dislikedElements,
      },
    });

    const latestProfile = await tx.userTasteProfile.findFirst({
      where: { userId: authResult.userId },
      orderBy: { profileVersion: "desc" },
      select: { profileVersion: true },
    });

    const vector = buildTasteProfile(parsed.data);

    const tasteProfile = await tx.userTasteProfile.create({
      data: {
        userId: authResult.userId,
        sourcePreferenceId: preference.id,
        profileVersion: (latestProfile?.profileVersion ?? 0) + 1,
        ...vector,
      },
    });

    await tx.user.update({
      where: { id: authResult.userId },
      data: { onboardingCompletedAt: new Date() },
    });

    return { preferenceId: preference.id, tasteProfileId: tasteProfile.id };
  });

  return Response.json(
    {
      ok: true,
      userPreferenceId: result.preferenceId,
      tasteProfileId: result.tasteProfileId,
    },
    { status: 201 },
  );
}
