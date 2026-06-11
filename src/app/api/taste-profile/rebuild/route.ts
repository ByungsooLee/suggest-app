import { getAppUserId } from "@/lib/auth/app-user";
import { prisma } from "@/lib/db/prisma";
import { buildTasteProfile } from "@/lib/taste-profile/buildTasteProfile";
import { MOOD_TAGS, type MoodTag } from "@/lib/constants/taxonomy";

export async function POST() {
  const userId = await getAppUserId();
  const latestPreference = await prisma.userPreference.findFirst({
    where: { userId: userId },
    orderBy: { createdAt: "desc" },
  });

  if (!latestPreference) {
    return Response.json(
      {
        code: "PREFERENCE_MISSING",
        message: "No onboarding preference found. Complete onboarding first.",
      },
      { status: 409 },
    );
  }

  const latestProfile = await prisma.userTasteProfile.findFirst({
    where: { userId: userId },
    orderBy: { profileVersion: "desc" },
    select: { profileVersion: true },
  });

  const moodSet = new Set(MOOD_TAGS);
  const preferredMoods = latestPreference.preferredMoods.filter((value): value is MoodTag => moodSet.has(value as MoodTag));

  const vector = buildTasteProfile({
    favoriteArtists: latestPreference.favoriteArtists,
    favoriteMovies: latestPreference.favoriteMovies,
    preferredMoods,
    dislikedElements: latestPreference.dislikedElements,
  });

  const profile = await prisma.userTasteProfile.create({
    data: {
      userId: userId,
      sourcePreferenceId: latestPreference.id,
      profileVersion: (latestProfile?.profileVersion ?? 0) + 1,
      ...vector,
    },
  });

  return Response.json(
    {
      ok: true,
      tasteProfileId: profile.id,
      profileVersion: profile.profileVersion,
    },
    { status: 201 },
  );
}
