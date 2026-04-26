import { requireUser } from "@/lib/auth/require-user";
import { isMissingUserWatchlistTableError } from "@/lib/db/prisma-compat";
import { prisma } from "@/lib/db/prisma";
import { toWatchedItemDto } from "@/lib/mypage/watched-content";
import { parseJson } from "@/lib/validation/http";
import { MoveWatchlistToWatchedSchema } from "@/lib/validation/schemas";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;
  const { id } = await context.params;
  if (!id) return Response.json({ code: "VALIDATION_ERROR", message: "id is required." }, { status: 422 });

  const parsed = await parseJson(request, MoveWatchlistToWatchedSchema);
  if (!parsed.ok) return parsed.response;

  let item: Awaited<ReturnType<typeof prisma.userWatchlistItem.findFirst>> = null;
  try {
    item = await prisma.userWatchlistItem.findFirst({
      where: { id, userId: authResult.userId },
    });
  } catch (error) {
    if (!isMissingUserWatchlistTableError(error)) throw error;
    return Response.json(
      {
        code: "WATCHLIST_UPGRADE_REQUIRED",
        message: "Watchlist移動にはDBマイグレーション適用が必要です。",
      },
      { status: 503 },
    );
  }
  if (!item) return Response.json({ code: "NOT_FOUND", message: "Watchlist item not found." }, { status: 404 });

  let createdId = "";
  try {
    await prisma.$transaction(async (tx) => {
      const created = await tx.userWatchedContent.create({
        data: {
          userId: authResult.userId,
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
  } catch (error) {
    if (!isMissingUserWatchlistTableError(error)) throw error;
    return Response.json(
      {
        code: "WATCHLIST_UPGRADE_REQUIRED",
        message: "Watchlist移動にはDBマイグレーション適用が必要です。",
      },
      { status: 503 },
    );
  }

  const createdItem = await prisma.userWatchedContent.findFirst({
    where: { id: createdId, userId: authResult.userId },
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
