import { getAppUserId } from "@/lib/auth/app-user";
import { prisma } from "@/lib/db/prisma";
import { parseJson } from "@/lib/validation/http";
import { WatchedPatchSchema } from "@/lib/validation/schemas";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const userId = await getAppUserId();
  const { id } = await context.params;
  if (!id) {
    return Response.json({ code: "VALIDATION_ERROR", message: "id is required." }, { status: 422 });
  }

  const parsed = await parseJson(request, WatchedPatchSchema);
  if (!parsed.ok) return parsed.response;
  if (Object.keys(parsed.data).length === 0) {
    return Response.json({ code: "VALIDATION_ERROR", message: "No fields provided." }, { status: 422 });
  }

  const updated = await prisma.userWatchedContent.updateMany({
    where: { id, userId },
    data: {
      watchedAt: parsed.data.watchedAt === undefined ? undefined : parsed.data.watchedAt ? new Date(parsed.data.watchedAt) : null,
      ratingScore: parsed.data.ratingScore,
      reaction: parsed.data.reaction,
      watchSource: parsed.data.watchSource,
      memo: parsed.data.memo,
      rewatch: parsed.data.rewatch,
      watched: parsed.data.watched,
    },
  });
  if (updated.count === 0) {
    return Response.json({ code: "NOT_FOUND", message: "Watched item not found." }, { status: 404 });
  }
  return Response.json({ ok: true }, { status: 200 });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const userId = await getAppUserId();
  const { id } = await context.params;
  if (!id) {
    return Response.json({ code: "VALIDATION_ERROR", message: "id is required." }, { status: 422 });
  }

  const deleted = await prisma.userWatchedContent.deleteMany({
    where: { id, userId },
  });
  if (deleted.count === 0) {
    return Response.json({ code: "NOT_FOUND", message: "Watched item not found." }, { status: 404 });
  }

  return Response.json({ ok: true }, { status: 200 });
}
