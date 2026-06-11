import { getAppUserId } from "@/lib/auth/app-user";
import { prisma } from "@/lib/db/prisma";
import { toWatchlistItemDto } from "@/lib/mypage/watchlist";
import { parseJson } from "@/lib/validation/http";
import { WatchlistPatchSchema } from "@/lib/validation/schemas";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const userId = await getAppUserId();
  const { id } = await context.params;
  if (!id) return Response.json({ code: "VALIDATION_ERROR", message: "id is required." }, { status: 422 });

  const parsed = await parseJson(request, WatchlistPatchSchema);
  if (!parsed.ok) return parsed.response;

  const updated = await prisma.userWatchlistItem.updateMany({
    where: { id, userId },
    data: {
      note: parsed.data.note ?? undefined,
      priority: parsed.data.priority ?? undefined,
    },
  });
  if (updated.count === 0) {
    return Response.json({ code: "NOT_FOUND", message: "Watchlist item not found." }, { status: 404 });
  }
  const item = await prisma.userWatchlistItem.findFirst({
    where: { id, userId },
    include: { movie: { select: { id: true, title: true, posterUrl: true } } },
  });
  if (!item) return Response.json({ code: "NOT_FOUND", message: "Watchlist item not found." }, { status: 404 });
  return Response.json({ item: toWatchlistItemDto(item) }, { status: 200 });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const userId = await getAppUserId();
  const { id } = await context.params;
  if (!id) return Response.json({ code: "VALIDATION_ERROR", message: "id is required." }, { status: 422 });

  const deleted = await prisma.userWatchlistItem.deleteMany({
    where: { id, userId },
  });
  if (deleted.count === 0) {
    return Response.json({ code: "NOT_FOUND", message: "Watchlist item not found." }, { status: 404 });
  }
  return Response.json({ ok: true }, { status: 200 });
}
