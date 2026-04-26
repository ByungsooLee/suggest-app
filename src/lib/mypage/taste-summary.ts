import { type UserWatchedContent } from "@prisma/client";

export function buildTasteSummary(args: {
  watched: Array<UserWatchedContent & { movie: { genrePrimary: string } | null }>;
  preferences: {
    favoriteGenres: string[];
    preferredDirectors: string[];
    preferredActors: string[];
  };
}) {
  const genreCounts = new Map<string, number>();
  for (const item of args.watched) {
    const genre = item.movie?.genrePrimary;
    if (!genre) continue;
    genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1);
  }
  const topGenre = [...genreCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const likedCount = args.watched.filter((item) => item.reaction === "like").length;
  const dislikeCount = args.watched.filter((item) => item.reaction === "dislike").length;
  const rewatchCount = args.watched.filter((item) => item.rewatch).length;

  const signals: string[] = [];
  if (topGenre) signals.push(`最近は ${topGenre} をよく視聴しています`);
  if (args.preferences.favoriteGenres.length > 0) signals.push(`お気に入りジャンル: ${args.preferences.favoriteGenres.slice(0, 3).join(", ")}`);
  if (args.preferences.preferredDirectors.length > 0) signals.push(`推し監督: ${args.preferences.preferredDirectors.slice(0, 2).join(", ")}`);
  if (args.preferences.preferredActors.length > 0) signals.push(`推し俳優: ${args.preferences.preferredActors.slice(0, 2).join(", ")}`);
  if (rewatchCount > 0) signals.push(`再視聴作品が ${rewatchCount} 件あります`);

  const tone =
    likedCount >= dislikeCount
      ? "感情の余韻や好みに寄せた作品を前向きに取り込む傾向があります。"
      : "好みの芯が明確で、合わない作品をしっかり見極める傾向があります。";

  const summaryBase = topGenre
    ? `あなたは ${topGenre} を軸に、気分に合わせて作品を選ぶタイプです。`
    : "あなたは気分や文脈に合わせて柔軟に作品を選ぶタイプです。";

  return {
    summary: `${summaryBase} ${tone}`,
    signals: signals.slice(0, 6),
  };
}
