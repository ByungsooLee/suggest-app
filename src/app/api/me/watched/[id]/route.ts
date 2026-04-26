import { requireUser } from "@/lib/auth/require-user";
import { isMissingUserWatchedContentTableError } from "@/lib/db/prisma-compat";
import { prisma } from "@/lib/db/prisma";
import { parseJson } from "@/lib/validation/http";
import { WatchedPatchSchema } from "@/lib/validation/schemas";

const LEGACY_PREFIX = "legacy_";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;

  const { id } = await context.params;
  if (!id) {
    return Response.json({ code: "VALIDATION_ERROR", message: "id is required." }, { status: 422 });
  }
  if (id.startsWith(LEGACY_PREFIX) || id.startsWith("legacy_movie_")) {
    return Response.json(
      {
        code: "LEGACY_ITEM_READONLY",
        message: "旧データ形式の視聴履歴は編集できません。新規形式で追加してください。",
      },
      { status: 409 },
    );
  }

  const parsed = await parseJson(request, WatchedPatchSchema);
  if (!parsed.ok) return parsed.response;
  if (Object.keys(parsed.data).length === 0) {
    return Response.json({ code: "VALIDATION_ERROR", message: "No fields provided." }, { status: 422 });
  }

  try {
    const updated = await prisma.userWatchedContent.updateMany({
      where: {
        id,
        userId: authResult.userId,
      },
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
  } catch (error) {
    if (!isMissingUserWatchedContentTableError(error)) throw error;
    return Response.json(
      {
        code: "WATCHED_UPGRADE_REQUIRED",
        message: "視聴履歴編集にはDBマイグレーション適用が必要です。",
      },
      { status: 503 },
    );
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;

  const { id } = await context.params;
  if (!id) {
    return Response.json({ code: "VALIDATION_ERROR", message: "id is required." }, { status: 422 });
  }

  if (id.startsWith(LEGACY_PREFIX)) {
    const legacyId = id.slice(LEGACY_PREFIX.length);
    const deleted = await prisma.userWatchedMovie.deleteMany({
      where: {
        id: legacyId,
        userId: authResult.userId,
      },
    });
    if (deleted.count === 0) {
      return Response.json({ code: "NOT_FOUND", message: "Watched item not found." }, { status: 404 });
    }
    return Response.json({ ok: true }, { status: 200 });
  }

  let deletedCount = 0;
  try {
    const deleted = await prisma.userWatchedContent.deleteMany({
      where: {
        id,
        userId: authResult.userId,
      },
    });
    deletedCount = deleted.count;
  } catch (error) {
    if (!isMissingUserWatchedContentTableError(error)) throw error;
    if (id.startsWith("legacy_movie_")) {
      const movieId = id.slice("legacy_movie_".length);
      const legacyDeleted = await prisma.userWatchedMovie.deleteMany({
        where: {
          userId: authResult.userId,
          movieId,
        },
      });
      deletedCount = legacyDeleted.count;
    }
  }

  if (deletedCount === 0) {
    return Response.json({ code: "NOT_FOUND", message: "Watched item not found." }, { status: 404 });
  }

  return Response.json({ ok: true }, { status: 200 });
}
