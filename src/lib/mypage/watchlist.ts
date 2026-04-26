import { type Movie, type UserWatchlistItem } from "@prisma/client";

export const WATCHLIST_POSTER_FALLBACK = "/images/no-poster.svg";

type WatchlistWithMovie = UserWatchlistItem & {
  movie: Pick<Movie, "id" | "title" | "posterUrl"> | null;
};

export function toWatchlistItemDto(item: WatchlistWithMovie) {
  return {
    id: item.id,
    title: item.title || item.movie?.title || "Untitled",
    contentType: item.contentType,
    posterUrl: item.posterUrl ?? item.movie?.posterUrl ?? WATCHLIST_POSTER_FALLBACK,
    movieId: item.movieId ?? item.movie?.id ?? null,
    note: item.note ?? null,
    priority: item.priority ?? null,
    source: item.source,
    savedAt: item.savedAt.toISOString(),
  };
}
