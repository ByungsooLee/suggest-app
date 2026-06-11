import { getAppUserId } from "@/lib/auth/app-user";
import { prisma } from "@/lib/db/prisma";
import { parseJson } from "@/lib/validation/http";
import { SwipeEventsRequestSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const userId = await getAppUserId();
  const parsed = await parseJson(request, SwipeEventsRequestSchema);
  if (!parsed.ok) return parsed.response;

  await prisma.$transaction(
    parsed.data.events.map((event) =>
      prisma.userMovieSwipe.create({
        data: {
          userId: userId,
          movieId: event.movieId,
          knownState: event.knownState,
          swipeAction: event.action,
          ratingScore: event.rating ?? null,
        },
      }),
    ),
  );

  const knownEvents = parsed.data.events.filter((event) => event.knownState === "known");
  if (knownEvents.length > 0) {
    const movieIds = [...new Set(knownEvents.map((event) => event.movieId))];
    const movies = await prisma.movie.findMany({
      where: { id: { in: movieIds } },
      select: { id: true, title: true, posterUrl: true },
    });
    const movieById = new Map(movies.map((movie) => [movie.id, movie]));

    await Promise.all(
      knownEvents.map((event) => {
        const movie = movieById.get(event.movieId);
        if (!movie) return Promise.resolve();

        const liked = (event.rating ?? 0) >= 4 || event.action === "liked";
        const source = liked ? "onboarding_liked" : "onboarding_known";

        return prisma.userWatchedContent.upsert({
          where: {
            userId_movieId_contentType: { userId, movieId: movie.id, contentType: "movie" },
          },
          create: {
            userId,
            movieId: movie.id,
            contentType: "movie",
            title: movie.title,
            posterUrl: movie.posterUrl,
            watched: true,
            source,
            catalogSource: "onboarding",
            reaction: liked ? "like" : "normal",
            ratingScore: event.rating ?? null,
          },
          update: {
            source,
            reaction: liked ? "like" : "normal",
            ratingScore: event.rating ?? null,
          },
        });
      }),
    );
  }

  return Response.json(
    {
      ok: true,
      savedCount: parsed.data.events.length,
    },
    { status: 201 },
  );
}
