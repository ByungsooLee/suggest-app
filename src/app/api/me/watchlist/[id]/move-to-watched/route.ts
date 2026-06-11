import { getAppUserId } from "@/lib/auth/app-user";
import { prisma } from "@/lib/db/prisma";
import { toWatchedItemDto } from "@/lib/mypage/watched-content";
import { parseJson } from "@/lib/validation/http";
import { MoveWatchlistToWatchedSchema } from "@/lib/validation/schemas";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const userId = await getAppUserId();
  const { id } = await context.params;
  if (!id) return Response.json({ code: "VALIDATION_ERROR", message: "id is required." }, { status: 422 });

  const parsed = await parseJson(request, MoveWatchlistToWatchedSchema);
  if (!parsed.ok) return parsed.response;

  const item = await prisma.userWatchlistItem.findFirst({
    where: { id, userId },
  });
  if (!item) return Response.json({ code: "NOT_FOUND", message: "Watchlist item not found." }, { status: 404 });

  let createdId = "";
  await prisma.$transaction(async (tx) => {
    const created = await tx.userWatchedContent.create({
      data: {
        userId,
        contentType: item.contentType,
        movieId: item.movieId,
        title: item.title,
        posterUrl: item.posterUrl,
        watched: true,
        watchedAt: parsed.data.watchedAt ? new Date(parsed.data.watchedAt) : new Date(),
        ratingScore: parsed.data.ratingScore ?? null,
        reaction: parsed.data.reaction ?? null,
        watchSource: parsed.data.watchSource ?? null,
        memo: parsed.data.memo ?? item.note ?? null,
        rewatch: parsed.data.rewatch,
        source: "manual",
      },
    });
    createdId = created.id;
    await tx.userWatchlistItem.delete({ where: { id: item.id } });
  });

  const createdItem = await prisma.userWatchedContent.findFirst({
    where: { id: createdId, userId },
    include: {
      movie: {
        select: {
          id: true,
          title: true,
          posterUrl: true,
        },
      },
    },
  });
  return Response.json({ ok: true, item: createdItem ? toWatchedItemDto(createdItem) : null }, { status: 201 });
}
