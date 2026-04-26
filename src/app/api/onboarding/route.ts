import { buildTasteProfile } from "@/lib/taste-profile/buildTasteProfile";
import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db/prisma";
import { type UserMood } from "@/lib/onboarding/mood-map";
import { parseJson } from "@/lib/validation/http";
import { OnboardingSubmitSchema } from "@/lib/validation/schemas";

function topNames(names: string[], limit: number) {
  const counts = new Map<string, number>();
  for (const raw of names) {
    const name = raw.trim();
    if (!name || name.toLowerCase().startsWith("unknown")) continue;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name]) => name);
}

export async function POST(request: Request) {
  try {
    const authResult = await requireUser();
    if (!authResult.ok) return authResult.response;

    const parsed = await parseJson(request, OnboardingSubmitSchema);
    if (!parsed.ok) return parsed.response;

    const moodToTags: Record<UserMood, Array<"calm" | "emotional" | "dark" | "funny" | "tense" | "uplifting" | "melancholic">> = {
      want_healing: ["calm", "uplifting"],
      want_to_be_moved: ["emotional", "melancholic"],
      want_excitement: ["tense", "uplifting"],
      want_to_laugh: ["funny", "uplifting"],
      want_tension: ["dark", "tense"],
      want_quiet_immersion: ["calm", "melancholic"],
      want_to_switch_off: ["calm", "uplifting"],
      okay_with_something_heavy: ["dark", "emotional"],
    };

    const movieIds = parsed.data.reactions.map((reaction) => reaction.movieId);
    const movieRows = await prisma.movie.findMany({
      where: { id: { in: movieIds } },
      select: { id: true, title: true, genrePrimary: true, directors: true, cast: true },
    });

    if (movieRows.length !== 14) {
      return Response.json(
        {
          code: "INVALID_ONBOARDING_MOVIES",
          message: "One or more onboarding movieIds are invalid.",
        },
        { status: 400 },
      );
    }

    const movieMap = new Map(movieRows.map((movie) => [movie.id, movie]));
    const likedReactions = parsed.data.reactions.filter((reaction) => reaction.reactionType === "liked");
    const rejectedReactions = parsed.data.reactions.filter((reaction) => reaction.reactionType === "not_for_me");

    const result = await prisma.$transaction(async (tx) => {
      const favoriteMovies = topNames(
        likedReactions.map((reaction) => movieMap.get(reaction.movieId)?.title ?? "").filter(Boolean),
        3,
      );

      const favoriteArtists = topNames(
        likedReactions
          .flatMap((reaction) => {
            const movie = movieMap.get(reaction.movieId);
            return [...(movie?.directors ?? []), ...(movie?.cast ?? []).slice(0, 2)];
          })
          .filter(Boolean),
        3,
      );

      const dislikedElements = topNames(
        rejectedReactions.map((reaction) => movieMap.get(reaction.movieId)?.genrePrimary ?? "").filter(Boolean),
        5,
      );
      const likedGenres = likedReactions
        .map((reaction) => movieMap.get(reaction.movieId)?.genrePrimary)
        .filter((value): value is string => Boolean(value));
      const preferredMoods = moodToTags[parsed.data.selectedMood];

      const preference = await tx.userPreference.create({
        data: {
          userId: authResult.userId,
          favoriteArtists: favoriteArtists.length > 0 ? favoriteArtists : ["No Artist Data"],
          favoriteMovies: favoriteMovies.length > 0 ? favoriteMovies : ["No Movie Data"],
          preferredMoods,
          dislikedElements,
        },
      });

      const latestProfile = await tx.userTasteProfile.findFirst({
        where: { userId: authResult.userId },
        orderBy: { profileVersion: "desc" },
        select: { profileVersion: true },
      });

      const vector = buildTasteProfile({
        favoriteArtists: favoriteArtists.length > 0 ? favoriteArtists : ["No Artist Data"],
        favoriteMovies: favoriteMovies.length > 0 ? favoriteMovies : ["No Movie Data"],
        preferredMoods,
        dislikedElements,
        mbtiType: parsed.data.mbtiType,
        swipeInsights: {
          total: parsed.data.reactions.length,
          likedCount: likedReactions.length,
          knownCount: likedReactions.length + rejectedReactions.length,
          likedGenres,
        },
      });

      const tasteProfile = await tx.userTasteProfile.create({
        data: {
          userId: authResult.userId,
          sourcePreferenceId: preference.id,
          profileVersion: (latestProfile?.profileVersion ?? 0) + 1,
          ...vector,
        },
      });

      const existingOnboarding = await tx.userOnboardingProfile.findFirst({
        where: { userId: authResult.userId },
        orderBy: { updatedAt: "desc" },
        select: { id: true },
      });
      if (existingOnboarding) {
        await tx.userOnboardingProfile.update({
          where: { id: existingOnboarding.id },
          data: {
            mbtiType: parsed.data.mbtiType,
            selectedMood: parsed.data.selectedMood,
            onboardingVersion: parsed.data.onboardingVersion,
          },
        });
      } else {
        await tx.userOnboardingProfile.create({
          data: {
            userId: authResult.userId,
            mbtiType: parsed.data.mbtiType,
            selectedMood: parsed.data.selectedMood,
            onboardingVersion: parsed.data.onboardingVersion,
          },
        });
      }

      await tx.onboardingMovieReaction.deleteMany({
        where: { userId: authResult.userId },
      });
      await tx.onboardingMovieReaction.createMany({
        data: parsed.data.reactions.map((reaction) => ({
          userId: authResult.userId,
          movieId: reaction.movieId,
          reactionType: reaction.reactionType,
        })),
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
  } catch (error) {
    console.error(error);
    return Response.json(
      {
        code: "ONBOARDING_SAVE_FAILED",
        message: "Failed to save onboarding. Please try again.",
      },
      { status: 500 },
    );
  }
}
