import { type UserWatchedContent, type Movie } from "@prisma/client";

export const WATCHED_POSTER_FALLBACK = "/images/no-poster.svg";

type WatchedWithMovie = UserWatchedContent & {
  movie: Pick<Movie, "id" | "title" | "posterUrl"> | null;
};

export function toWatchedItemDto(item: WatchedWithMovie) {
  const posterUrl = item.posterUrl ?? item.movie?.posterUrl ?? WATCHED_POSTER_FALLBACK;
  const title = item.title || item.movie?.title || "Untitled";
  return {
    id: item.id,
    title,
    contentType: item.contentType,
    posterUrl,
    watched: item.watched,
    watchedAt: item.watchedAt?.toISOString() ?? null,
    ratingScore: item.ratingScore ?? null,
    reaction: item.reaction ?? null,
    watchSource: item.watchSource ?? null,
    memo: item.memo ?? null,
    rewatch: item.rewatch,
    movieId: item.movieId ?? item.movie?.id ?? null,
    catalogSource: item.catalogSource,
    quickConfidence: item.quickConfidence ?? null,
  };
}

export function sanitizeOptionalText(value: string | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
