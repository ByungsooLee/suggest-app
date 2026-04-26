import { type UserWatchedContent, type UserWatchlistItem } from "@prisma/client";

type RankItem = { name: string; count: number };

function rankNames(items: string[][], limit = 5): RankItem[] {
  const counts = new Map<string, number>();
  for (const names of items) {
    for (const rawName of names) {
      const name = rawName.trim();
      if (!name || name.toLowerCase().startsWith("unknown")) continue;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

export function buildPersonalStats(args: {
  watched: Array<UserWatchedContent & { movie: { genrePrimary: string; directors: string[]; cast: string[] } | null }>;
  watchlist: UserWatchlistItem[];
}) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const watchedThisMonth = args.watched.filter((item) => {
    const targetDate = item.watchedAt ?? item.createdAt;
    return targetDate >= monthStart;
  }).length;
  const moviesCount = args.watched.filter((item) => item.contentType === "movie").length;
  const dramasCount = args.watched.filter((item) => item.contentType === "drama").length;
  const ratings = args.watched.map((item) => item.ratingScore).filter((score): score is number => typeof score === "number");
  const averageRating = ratings.length > 0 ? ratings.reduce((sum, score) => sum + score, 0) / ratings.length : null;

  return {
    totals: {
      watchedCount: args.watched.length,
      watchlistCount: args.watchlist.length,
      moviesCount,
      dramasCount,
      watchedThisMonth,
      averageRating,
    },
    topGenres: rankNames(
      args.watched.map((item) => (item.movie?.genrePrimary ? [item.movie.genrePrimary] : [])),
      5,
    ),
    topDirectors: rankNames(
      args.watched.map((item) => item.movie?.directors ?? []),
      5,
    ),
    topActors: rankNames(
      args.watched.map((item) => item.movie?.cast ?? []),
      5,
    ),
  };
}
