import { requireUser } from "@/lib/auth/require-user";
import { isMissingUserWatchlistTableError } from "@/lib/db/prisma-compat";
import { prisma } from "@/lib/db/prisma";
import { toWatchlistItemDto } from "@/lib/mypage/watchlist";
import { parseJson } from "@/lib/validation/http";
import { WatchlistCreateSchema } from "@/lib/validation/schemas";

export async function GET() {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;

  let items: Awaited<ReturnType<typeof prisma.userWatchlistItem.findMany>> = [];
  try {
    items = await prisma.userWatchlistItem.findMany({
      where: { userId: authResult.userId },
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            posterUrl: true,
          },
        },
      },
      orderBy: { savedAt: "desc" },
      take: 400,
    });
  } catch (error) {
    if (!isMissingUserWatchlistTableError(error)) throw error;
  }

  return Response.json({ items: items.map(toWatchlistItemDto) }, { status: 200 });
}

export async function POST(request: Request) {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;

  const parsed = await parseJson(request, WatchlistCreateSchema);
  if (!parsed.ok) return parsed.response;

  const movie = parsed.data.movieId
    ? await prisma.movie.findUnique({
        where: { id: parsed.data.movieId },
        select: { id: true, title: true, posterUrl: true },
      })
    : null;
  if (parsed.data.movieId && !movie) {
    return Response.json({ code: "MOVIE_NOT_FOUND", message: "movieId does not exist." }, { status: 404 });
  }

  let existing: { id: string } | null = null;
  if (movie?.id) {
    try {
      existing = await prisma.userWatchlistItem.findFirst({
        where: {
          userId: authResult.userId,
          movieId: movie.id,
          contentType: parsed.data.contentType,
        },
        select: { id: true },
      });
    } catch (error) {
      if (!isMissingUserWatchlistTableError(error)) throw error;
      return Response.json(
        {
          code: "WATCHLIST_UPGRADE_REQUIRED",
          message: "Watchlist機能にはDBマイグレーション適用が必要です。",
        },
        { status: 503 },
      );
    }
  }

  if (existing) {
    try {
      const updated = await prisma.userWatchlistItem.update({
        where: { id: existing.id },
        data: {
          title: parsed.data.title?.trim() || movie?.title || undefined,
          posterUrl: parsed.data.posterUrl?.trim() || movie?.posterUrl || undefined,
          note: parsed.data.note?.trim() || null,
          priority: parsed.data.priority ?? null,
          source: parsed.data.source,
          recommendedFromResultId: parsed.data.recommendedFromResultId ?? undefined,
          savedAt: new Date(),
        },
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
      return Response.json({ item: toWatchlistItemDto(updated) }, { status: 200 });
    } catch (error) {
      if (!isMissingUserWatchlistTableError(error)) throw error;
      return Response.json(
        {
          code: "WATCHLIST_UPGRADE_REQUIRED",
          message: "Watchlist機能にはDBマイグレーション適用が必要です。",
        },
        { status: 503 },
      );
    }
  }

  try {
    const created = await prisma.userWatchlistItem.create({
      data: {
        userId: authResult.userId,
        contentType: parsed.data.contentType,
        movieId: movie?.id ?? null,
        title: parsed.data.title?.trim() || movie?.title || "Untitled",
        posterUrl: parsed.data.posterUrl?.trim() || movie?.posterUrl || null,
        note: parsed.data.note?.trim() || null,
        priority: parsed.data.priority ?? null,
        source: parsed.data.source,
        recommendedFromResultId: parsed.data.recommendedFromResultId ?? null,
      },
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
    return Response.json({ item: toWatchlistItemDto(created) }, { status: 201 });
  } catch (error) {
    if (!isMissingUserWatchlistTableError(error)) throw error;
    return Response.json(
      {
        code: "WATCHLIST_UPGRADE_REQUIRED",
        message: "Watchlist機能にはDBマイグレーション適用が必要です。",
      },
      { status: 503 },
    );
  }
}
