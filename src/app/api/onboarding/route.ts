import { buildTasteProfile } from "@/lib/taste-profile/buildTasteProfile";
import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db/prisma";
import { parseJson } from "@/lib/validation/http";
import { OnboardingFastPathSchema, OnboardingRequestSchema, OnboardingSubmitSchema } from "@/lib/validation/schemas";

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
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;

  const parsed = await parseJson(request, OnboardingSubmitSchema);
  if (!parsed.ok) return parsed.response;

  const maybeFastPath = OnboardingFastPathSchema.safeParse(parsed.data);
  const fastPathData = maybeFastPath.success ? maybeFastPath.data : null;
  const legacyData = OnboardingRequestSchema.safeParse(parsed.data).success ? OnboardingRequestSchema.parse(parsed.data) : null;
  const movieIds = fastPathData ? Array.from(new Set(fastPathData.swipeEvents.map((event) => event.movieId))) : [];
  const movieRows =
    movieIds.length > 0
      ? await prisma.movie.findMany({
          where: { id: { in: movieIds } },
          select: { id: true, title: true, genrePrimary: true, directors: true, cast: true },
        })
      : [];
  const movieMap = new Map(movieRows.map((movie) => [movie.id, movie]));

  const result = await prisma.$transaction(async (tx) => {
    const normalizedInput = fastPathData
      ? (() => {
          const likedKnown = fastPathData.swipeEvents.filter(
            (event) => event.knownState === "known" && (event.rating ?? (event.action === "liked" ? 4 : 2)) >= 4,
          );
          const known = fastPathData.swipeEvents.filter((event) => event.knownState === "known");
          const favoriteMovies = topNames(
            likedKnown.map((event) => movieMap.get(event.movieId)?.title ?? "").filter(Boolean),
            3,
          );
          const favoriteArtists = topNames(
            likedKnown
              .flatMap((event) => {
                const movie = movieMap.get(event.movieId);
                return [...(movie?.directors ?? []), ...(movie?.cast ?? []).slice(0, 2)];
              })
              .filter(Boolean),
            3,
          );
          const likedGenres = likedKnown
            .map((event) => movieMap.get(event.movieId)?.genrePrimary)
            .filter((value): value is string => Boolean(value));

          return {
            favoriteArtists: favoriteArtists.length > 0 ? favoriteArtists : ["No Artist Data"],
            favoriteMovies: favoriteMovies.length > 0 ? favoriteMovies : ["No Movie Data"],
            preferredMoods: fastPathData.preferredMoods,
            dislikedElements: fastPathData.dislikedElements,
            mbtiType: fastPathData.mbtiType,
            onboardingVersion: fastPathData.onboardingVersion,
            swipeEvents: fastPathData.swipeEvents,
            swipeInsights: {
              total: fastPathData.swipeEvents.length,
              likedCount: fastPathData.swipeEvents.filter(
                (event) => event.knownState === "known" && (event.rating ?? (event.action === "liked" ? 4 : 2)) >= 4,
              ).length,
              knownCount: known.length,
              likedGenres,
            },
          };
        })()
      : {
          favoriteArtists: legacyData?.favoriteArtists ?? ["No Artist Data"],
          favoriteMovies: legacyData?.favoriteMovies ?? ["No Movie Data"],
          preferredMoods: legacyData?.preferredMoods ?? ["calm"],
          dislikedElements: legacyData?.dislikedElements ?? [],
          mbtiType: undefined,
          onboardingVersion: 1,
          swipeEvents: [],
          swipeInsights: undefined,
        };

    const preference = await tx.userPreference.create({
      data: {
        userId: authResult.userId,
        favoriteArtists: normalizedInput.favoriteArtists,
        favoriteMovies: normalizedInput.favoriteMovies,
        preferredMoods: normalizedInput.preferredMoods,
        dislikedElements: normalizedInput.dislikedElements,
      },
    });

    const latestProfile = await tx.userTasteProfile.findFirst({
      where: { userId: authResult.userId },
      orderBy: { profileVersion: "desc" },
      select: { profileVersion: true },
    });

    const vector = buildTasteProfile({
      favoriteArtists: normalizedInput.favoriteArtists,
      favoriteMovies: normalizedInput.favoriteMovies,
      preferredMoods: normalizedInput.preferredMoods,
      dislikedElements: normalizedInput.dislikedElements,
      mbtiType: normalizedInput.mbtiType,
      swipeInsights: normalizedInput.swipeInsights,
    });

    const tasteProfile = await tx.userTasteProfile.create({
      data: {
        userId: authResult.userId,
        sourcePreferenceId: preference.id,
        profileVersion: (latestProfile?.profileVersion ?? 0) + 1,
        ...vector,
      },
    });

    if (fastPathData) {
      await tx.userOnboardingProfile.create({
        data: {
          userId: authResult.userId,
          mbtiType: fastPathData.mbtiType,
          onboardingVersion: fastPathData.onboardingVersion,
        },
      });

      if (normalizedInput.swipeEvents.length > 0) {
        await tx.userMovieSwipe.createMany({
          data: normalizedInput.swipeEvents.map((event) => ({
            userId: authResult.userId,
            movieId: event.movieId,
            knownState: event.knownState,
            swipeAction: event.action,
            ratingScore: event.rating ?? null,
          })),
        });
      }

      const watchedRows: Array<{
        userId: string;
        movieId: string;
        source: "onboarding_liked" | "onboarding_known";
      }> = normalizedInput.swipeEvents
        .filter((event) => event.knownState === "known")
        .map((event) => ({
          userId: authResult.userId,
          movieId: event.movieId,
          source: (event.rating ?? 0) >= 4 || event.action === "liked" ? "onboarding_liked" : "onboarding_known",
        }));
      if (watchedRows.length > 0) {
        await tx.userWatchedMovie.createMany({
          data: watchedRows,
          skipDuplicates: true,
        });
      }
    }

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
