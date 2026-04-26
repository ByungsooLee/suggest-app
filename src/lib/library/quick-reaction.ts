import { prisma } from "@/lib/db/prisma";

type QuickReactionAction = "seen" | "not_seen" | "liked" | "not_for_me" | "skip";

function actionToWatchedUpdate(action: QuickReactionAction) {
  if (action === "skip" || action === "not_seen") return null;
  if (action === "liked") return { watched: true, reaction: "like" as const };
  if (action === "not_for_me") return { watched: true, reaction: "dislike" as const };
  return { watched: true, reaction: "normal" as const };
}

export async function persistQuickReactions(args: {
  userId: string;
  events: Array<{
    movieId: string;
    action: QuickReactionAction;
    shownAt: string;
    sessionToken?: string;
  }>;
}) {
  if (args.events.length === 0) {
    return { savedCount: 0, upsertedLibraryCount: 0 };
  }

  const movieIds = Array.from(new Set(args.events.map((event) => event.movieId)));
  const movies = await prisma.movie.findMany({
    where: { id: { in: movieIds } },
    select: {
      id: true,
      title: true,
      posterUrl: true,
    },
  });
  const movieById = new Map(movies.map((movie) => [movie.id, movie]));

  let upsertedLibraryCount = 0;

  await prisma.$transaction(async (tx) => {
    await tx.quickReactionLog.createMany({
      data: args.events
        .filter((event) => movieById.has(event.movieId))
        .map((event) => ({
          userId: args.userId,
          movieId: event.movieId,
          action: event.action,
          shownAt: new Date(event.shownAt),
          sessionToken: event.sessionToken ?? null,
        })),
    });

    for (const event of args.events) {
      const watchedUpdate = actionToWatchedUpdate(event.action);
      const movie = movieById.get(event.movieId);
      if (!watchedUpdate || !movie) continue;

      await tx.userWatchedContent.upsert({
        where: {
          userId_movieId_contentType: {
            userId: args.userId,
            movieId: movie.id,
            contentType: "movie",
          },
        },
        update: {
          watched: true,
          reaction: watchedUpdate.reaction,
          watchedAt: new Date(event.shownAt),
          catalogSource: "quick_classify",
          quickConfidence: 80,
        },
        create: {
          userId: args.userId,
          contentType: "movie",
          movieId: movie.id,
          title: movie.title,
          posterUrl: movie.posterUrl,
          watched: true,
          watchedAt: new Date(event.shownAt),
          reaction: watchedUpdate.reaction,
          source: "manual",
          catalogSource: "quick_classify",
          quickConfidence: 80,
        },
      });
      upsertedLibraryCount += 1;
    }
  });

  return {
    savedCount: args.events.length,
    upsertedLibraryCount,
  };
}
