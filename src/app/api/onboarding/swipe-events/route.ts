import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db/prisma";
import { parseJson } from "@/lib/validation/http";
import { SwipeEventsRequestSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;

  const parsed = await parseJson(request, SwipeEventsRequestSchema);
  if (!parsed.ok) return parsed.response;

  await prisma.$transaction(
    parsed.data.events.map((event) =>
      prisma.userMovieSwipe.create({
        data: {
          userId: authResult.userId,
          movieId: event.movieId,
          knownState: event.knownState,
          swipeAction: event.action,
          ratingScore: event.rating ?? null,
        },
      }),
    ),
  );

  const watchedRows: Array<{
    userId: string;
    movieId: string;
    source: "onboarding_liked" | "onboarding_known";
  }> = parsed.data.events
    .filter((event) => event.knownState === "known")
    .map((event) => ({
      userId: authResult.userId,
      movieId: event.movieId,
      source: (event.rating ?? 0) >= 4 || event.action === "liked" ? "onboarding_liked" : "onboarding_known",
    }));

  if (watchedRows.length > 0) {
    await prisma.userWatchedMovie.createMany({
      data: watchedRows,
      skipDuplicates: true,
    });
  }

  return Response.json(
    {
      ok: true,
      savedCount: parsed.data.events.length,
    },
    { status: 201 },
  );
}
