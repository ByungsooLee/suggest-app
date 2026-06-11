import { getAppUserId } from "@/lib/auth/app-user";
import { prisma } from "@/lib/db/prisma";

type HistoryStatus = "recommended" | "saved" | "watched" | "skipped";

export async function GET() {
  const userId = await getAppUserId();
  const results = await prisma.recommendationResult.findMany({
    where: { session: { userId: userId } },
    select: {
      id: true,
      sessionId: true,
      movieId: true,
      rank: true,
      createdAt: true,
      reason1: true,
      reason2: true,
      reason3: true,
      movie: {
        select: {
          title: true,
          localizedTitles: true,
          localizedData: true,
          posterUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  if (results.length === 0) {
    return Response.json({ items: [] }, { status: 200 });
  }

  const resultIds = results.map((result) => result.id);
  const movieIds = Array.from(new Set(results.map((result) => result.movieId)));

  const watchlistItems = await prisma.userWatchlistItem.findMany({
    where: {
      userId,
      recommendedFromResultId: { in: resultIds },
    },
    select: {
      recommendedFromResultId: true,
      savedAt: true,
    },
  });
  const watchlistByResultId = new Map(
    watchlistItems
      .filter((item): item is { recommendedFromResultId: string; savedAt: Date } => Boolean(item.recommendedFromResultId))
      .map((item) => [item.recommendedFromResultId, item.savedAt]),
  );

  const watchedByMovieId = new Map<string, Date>();
  const watchedItems = await prisma.userWatchedContent.findMany({
    where: {
      userId,
      contentType: "movie",
      watched: true,
      movieId: { in: movieIds },
    },
    select: {
      movieId: true,
      watchedAt: true,
      createdAt: true,
    },
  });
  for (const item of watchedItems) {
    if (!item.movieId) continue;
    const watchedAt = item.watchedAt ?? item.createdAt;
    const prev = watchedByMovieId.get(item.movieId);
    if (!prev || prev < watchedAt) {
      watchedByMovieId.set(item.movieId, watchedAt);
    }
  }

  const feedbackLogs = await prisma.feedbackLog.findMany({
    where: {
      userId: userId,
      recommendationResultId: { in: resultIds },
    },
    select: {
      recommendationResultId: true,
      reaction: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const feedbackByResultId = new Map<string, { reaction: (typeof feedbackLogs)[number]["reaction"]; createdAt: Date }>();
  for (const log of feedbackLogs) {
    if (!log.recommendationResultId) continue;
    if (!feedbackByResultId.has(log.recommendationResultId)) {
      feedbackByResultId.set(log.recommendationResultId, { reaction: log.reaction, createdAt: log.createdAt });
    }
  }

  const items = results.map((result) => {
    const savedAt = watchlistByResultId.get(result.id) ?? null;
    const watchedAt = watchedByMovieId.get(result.movieId) ?? null;
    const feedback = feedbackByResultId.get(result.id) ?? null;

    let status: HistoryStatus = "recommended";
    if (watchedAt) {
      status = "watched";
    } else if (savedAt) {
      status = "saved";
    } else if (feedback && feedback.reaction !== "liked") {
      status = "skipped";
    }

    return {
      id: result.id,
      sessionId: result.sessionId,
      movieId: result.movieId,
      title: result.movie.title,
      localizedTitles: result.movie.localizedTitles,
      localizedData: result.movie.localizedData,
      posterUrl: result.movie.posterUrl ?? null,
      rank: result.rank,
      recommendedAt: result.createdAt.toISOString(),
      reasons: [result.reason1, result.reason2, result.reason3].filter((reason): reason is string => Boolean(reason)),
      status,
      savedAt: savedAt?.toISOString() ?? null,
      watchedAt: watchedAt?.toISOString() ?? null,
      feedbackReaction: feedback?.reaction ?? null,
    };
  });

  return Response.json({ items }, { status: 200 });
}
