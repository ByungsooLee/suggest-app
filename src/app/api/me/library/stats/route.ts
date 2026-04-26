import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;

  const [watchedItems, recentQuickReactions] = await Promise.all([
    prisma.userWatchedContent.findMany({
      where: { userId: authResult.userId },
      select: { contentType: true, reaction: true },
      take: 2000,
    }),
    prisma.quickReactionLog.count({
      where: {
        userId: authResult.userId,
        createdAt: {
          gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
        },
      },
    }),
  ]);

  const reactionCounts = watchedItems.reduce(
    (acc, item) => {
      if (item.reaction === "like") acc.like += 1;
      if (item.reaction === "normal") acc.normal += 1;
      if (item.reaction === "dislike") acc.dislike += 1;
      return acc;
    },
    { like: 0, normal: 0, dislike: 0 },
  );

  const movieCount = watchedItems.filter((item) => item.contentType === "movie").length;
  const dramaCount = watchedItems.filter((item) => item.contentType === "drama").length;

  return Response.json(
    {
      totals: {
        watchedCount: watchedItems.length,
        movieCount,
        dramaCount,
      },
      reactions: reactionCounts,
      recentQuickReactions,
    },
    { status: 200 },
  );
}
