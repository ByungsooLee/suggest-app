import { type WatchedContentType } from "@prisma/client";
import { z } from "zod";

import { getAppUserId } from "@/lib/auth/app-user";
import { prisma } from "@/lib/db/prisma";
import { sanitizeOptionalText, toWatchedItemDto } from "@/lib/mypage/watched-content";
import { parseJson } from "@/lib/validation/http";
import { WatchedCreateSchema } from "@/lib/validation/schemas";

const WatchedTypeFilterSchema = z.enum(["all", "movie", "drama"]);
const WatchedSortSchema = z.enum(["recently_added", "watched_date", "reaction", "release_year"]);
const WatchedReactionFilterSchema = z.enum(["like", "normal", "dislike"]);

type WatchedListItemWithSort = ReturnType<typeof toWatchedItemDto> & {
  createdSortKey: string;
  watchedSortKey: string | null;
  releaseYearSortKey: number | null;
};

function matchesType(item: WatchedListItemWithSort, typeFilter: "all" | WatchedContentType) {
  return typeFilter === "all" || item.contentType === typeFilter;
}

export async function GET(request: Request) {
  const userId = await getAppUserId();
  const { searchParams } = new URL(request.url);
  const parsedType = WatchedTypeFilterSchema.safeParse(searchParams.get("type") ?? "all");
  if (!parsedType.success) {
    return Response.json({ code: "VALIDATION_ERROR", message: "type must be all, movie, or drama." }, { status: 422 });
  }
  const parsedSort = WatchedSortSchema.safeParse(searchParams.get("sort") ?? "recently_added");
  if (!parsedSort.success) {
    return Response.json(
      { code: "VALIDATION_ERROR", message: "sort must be recently_added, watched_date, reaction, or release_year." },
      { status: 422 },
    );
  }
  const reactionParam = searchParams.get("reaction");
  const parsedReaction = reactionParam ? WatchedReactionFilterSchema.safeParse(reactionParam) : { success: true as const, data: null };
  if (!parsedReaction.success) {
    return Response.json({ code: "VALIDATION_ERROR", message: "reaction must be like, normal, or dislike." }, { status: 422 });
  }
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";

  const modernItems = await prisma.userWatchedContent.findMany({
    where: { userId },
    include: {
      movie: {
        select: {
          id: true,
          title: true,
          posterUrl: true,
          releaseYear: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 800,
  });

  const modernDto: WatchedListItemWithSort[] = modernItems.map((item) => ({
    ...toWatchedItemDto(item),
    createdSortKey: item.createdAt.toISOString(),
    watchedSortKey: item.watchedAt?.toISOString() ?? null,
    releaseYearSortKey: item.movie?.releaseYear ?? null,
  }));

  const typeFilter = parsedType.data === "all" ? "all" : (parsedType.data as WatchedContentType);
  const items = modernDto
    .filter((item) => matchesType(item, typeFilter))
    .filter((item) => (parsedReaction.data ? item.reaction === parsedReaction.data : true))
    .filter((item) => (q ? item.title.toLowerCase().includes(q) : true))
    .sort((a, b) => {
      if (parsedSort.data === "watched_date") {
        const aKey = a.watchedSortKey ?? "";
        const bKey = b.watchedSortKey ?? "";
        if (aKey === bKey) return a.createdSortKey < b.createdSortKey ? 1 : -1;
        return aKey < bKey ? 1 : -1;
      }
      if (parsedSort.data === "reaction") {
        const reactionOrder: Record<string, number> = { like: 3, normal: 2, dislike: 1 };
        const aReaction = a.reaction ? reactionOrder[a.reaction] : 0;
        const bReaction = b.reaction ? reactionOrder[b.reaction] : 0;
        if (aReaction === bReaction) return a.createdSortKey < b.createdSortKey ? 1 : -1;
        return bReaction - aReaction;
      }
      if (parsedSort.data === "release_year") {
        const aYear = a.releaseYearSortKey ?? 0;
        const bYear = b.releaseYearSortKey ?? 0;
        if (aYear === bYear) return a.createdSortKey < b.createdSortKey ? 1 : -1;
        return bYear - aYear;
      }
      return a.createdSortKey < b.createdSortKey ? 1 : -1;
    })
    .map((item) => ({
      id: item.id,
      title: item.title,
      contentType: item.contentType,
      posterUrl: item.posterUrl,
      watched: item.watched,
      watchedAt: item.watchedAt,
      ratingScore: item.ratingScore,
      reaction: item.reaction,
      watchSource: item.watchSource,
      memo: item.memo,
      rewatch: item.rewatch,
      movieId: item.movieId,
      catalogSource: item.catalogSource,
      quickConfidence: item.quickConfidence,
    }));

  return Response.json({ items }, { status: 200 });
}

export async function POST(request: Request) {
  const userId = await getAppUserId();
  const parsed = await parseJson(request, WatchedCreateSchema);
  if (!parsed.ok) return parsed.response;

  const titleFromInput = sanitizeOptionalText(parsed.data.title);
  const posterUrlFromInput = sanitizeOptionalText(parsed.data.posterUrl);

  const movie = parsed.data.movieId
    ? await prisma.movie.findUnique({
        where: { id: parsed.data.movieId },
        select: { id: true, title: true, posterUrl: true, releaseYear: true },
      })
    : null;

  if (parsed.data.movieId && !movie) {
    return Response.json({ code: "MOVIE_NOT_FOUND", message: "movieId does not exist." }, { status: 404 });
  }

  const payload = {
    userId: userId,
    contentType: parsed.data.contentType,
    movieId: movie?.id ?? null,
    title: titleFromInput ?? movie?.title ?? "Untitled",
    posterUrl: posterUrlFromInput ?? movie?.posterUrl ?? null,
    watched: parsed.data.watched,
    watchedAt: parsed.data.watchedAt ? new Date(parsed.data.watchedAt) : null,
    ratingScore: parsed.data.ratingScore ?? null,
    reaction: parsed.data.reaction ?? null,
    watchSource: parsed.data.watchSource ?? null,
    memo: sanitizeOptionalText(parsed.data.memo) ?? null,
    rewatch: parsed.data.rewatch,
    source: "manual" as const,
    catalogSource: parsed.data.catalogSource,
    quickConfidence: parsed.data.quickConfidence ?? null,
  };

  const created = movie?.id
    ? await prisma.userWatchedContent.upsert({
        where: {
          userId_movieId_contentType: {
            userId,
            movieId: movie.id,
            contentType: parsed.data.contentType,
          },
        },
        update: {
          title: payload.title,
          posterUrl: payload.posterUrl,
          watched: payload.watched,
          watchedAt: payload.watchedAt,
          ratingScore: payload.ratingScore,
          reaction: payload.reaction,
          watchSource: payload.watchSource,
          memo: payload.memo,
          rewatch: payload.rewatch,
          catalogSource: payload.catalogSource,
          quickConfidence: payload.quickConfidence,
        },
        create: payload,
        include: {
          movie: {
            select: {
              id: true,
              title: true,
              posterUrl: true,
              releaseYear: true,
            },
          },
        },
      })
    : await prisma.userWatchedContent.create({
        data: payload,
        include: {
          movie: {
            select: {
              id: true,
              title: true,
              posterUrl: true,
              releaseYear: true,
            },
          },
        },
      });

  return Response.json({ item: toWatchedItemDto(created) }, { status: 201 });
}
