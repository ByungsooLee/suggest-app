import { requireUser } from "@/lib/auth/require-user";
import { isMissingUserWatchlistTableError } from "@/lib/db/prisma-compat";
import { prisma } from "@/lib/db/prisma";
import { toWatchlistItemDto } from "@/lib/mypage/watchlist";
import { parseJson } from "@/lib/validation/http";
import { WatchlistPatchSchema } from "@/lib/validation/schemas";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;

  const { id } = await context.params;
  if (!id) return Response.json({ code: "VALIDATION_ERROR", message: "id is required." }, { status: 422 });

  const parsed = await parseJson(request, WatchlistPatchSchema);
  if (!parsed.ok) return parsed.response;

  let updatedCount = 0;
  try {
    const updated = await prisma.userWatchlistItem.updateMany({
      where: {
        id,
        userId: authResult.userId,
      },
      data: {
        note: parsed.data.note ?? undefined,
        priority: parsed.data.priority ?? undefined,
      },
    });
    updatedCount = updated.count;
  } catch (error) {
    if (!isMissingUserWatchlistTableError(error)) throw error;
    return Response.json(
      {
        code: "WATCHLIST_UPGRADE_REQUIRED",
        message: "Watchlist編集にはDBマイグレーション適用が必要です。",
      },
      { status: 503 },
    );
  }
  if (updatedCount === 0) {
    return Response.json({ code: "NOT_FOUND", message: "Watchlist item not found." }, { status: 404 });
  }
  const item = await prisma.userWatchlistItem.findFirst({
    where: { id, userId: authResult.userId },
    include: { movie: { select: { id: true, title: true, posterUrl: true } } },
  });
  if (!item) return Response.json({ code: "NOT_FOUND", message: "Watchlist item not found." }, { status: 404 });
  return Response.json({ item: toWatchlistItemDto(item) }, { status: 200 });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;
  const { id } = await context.params;
  if (!id) return Response.json({ code: "VALIDATION_ERROR", message: "id is required." }, { status: 422 });

  let deletedCount = 0;
  try {
    const deleted = await prisma.userWatchlistItem.deleteMany({
      where: {
        id,
        userId: authResult.userId,
      },
    });
    deletedCount = deleted.count;
  } catch (error) {
    if (!isMissingUserWatchlistTableError(error)) throw error;
    return Response.json(
      {
        code: "WATCHLIST_UPGRADE_REQUIRED",
        message: "Watchlist削除にはDBマイグレーション適用が必要です。",
      },
      { status: 503 },
    );
  }
  if (deletedCount === 0) {
    return Response.json({ code: "NOT_FOUND", message: "Watchlist item not found." }, { status: 404 });
  }
  return Response.json({ ok: true }, { status: 200 });
}
