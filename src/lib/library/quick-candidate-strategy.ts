import { averageVectors, cosineSimilarity, extractMovieVector } from "@/lib/recommendation/feature-vector";

type CandidateMovie = {
  id: string;
  title: string;
  releaseYear: number;
  posterUrl: string | null;
  overview: string | null;
  genrePrimary: string;
  directors: string[];
  cast: string[];
  reviewScore: number | null;
  moodCalm: number;
  moodDark: number;
  moodEmotional: number;
  moodUplifting: number;
  toneStylish: number;
  toneFunny: number;
  paceFast: number;
  paceSlowBurn: number;
  complexity: number;
  emotionalWeight: number;
  tension: number;
  accessibility: number;
};

type BucketName = "anchor" | "genre_diverse" | "era_diverse" | "taste_adjacent" | "boundary_test" | "exploratory";

export type QuickCandidateItem = {
  movieId: string;
  title: string;
  releaseYear: number | null;
  posterUrl: string | null;
  overview: string | null;
  directors: string[];
  cast: string[];
  genrePrimary: string | null;
  strategyBucket: BucketName;
};

function seededHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickUnique(
  target: QuickCandidateItem[],
  pool: CandidateMovie[],
  bucket: BucketName,
  seen: Set<string>,
  maxCount: number,
) {
  for (const movie of pool) {
    if (target.length >= maxCount) return;
    if (seen.has(movie.id)) continue;
    seen.add(movie.id);
    target.push({
      movieId: movie.id,
      title: movie.title,
      releaseYear: movie.releaseYear ?? null,
      posterUrl: movie.posterUrl ?? null,
      overview: movie.overview ?? null,
      directors: movie.directors.slice(0, 3),
      cast: movie.cast.slice(0, 3),
      genrePrimary: movie.genrePrimary ?? null,
      strategyBucket: bucket,
    });
  }
}

export function selectQuickCandidates(args: {
  userId: string;
  movies: CandidateMovie[];
  excludedMovieIds: Set<string>;
  likedSeedMovies: CandidateMovie[];
  rejectedSeedMovies: CandidateMovie[];
  limit: number;
}) {
  const eligible = args.movies.filter((movie) => !args.excludedMovieIds.has(movie.id));
  const seed = seededHash(`${args.userId}:${new Date().toISOString().slice(0, 10)}`);
  const shuffled = [...eligible].sort((a, b) => ((seed + a.id.length * 13) % 97) - ((seed + b.id.length * 13) % 97));
  const likedCenter = averageVectors(args.likedSeedMovies.map((movie) => extractMovieVector(movie)));
  const rejectedCenter = averageVectors(args.rejectedSeedMovies.map((movie) => extractMovieVector(movie)));

  const similaritySorted = shuffled
    .map((movie) => ({
      movie,
      likedSimilarity: likedCenter ? cosineSimilarity(likedCenter, extractMovieVector(movie)) : 0.5,
      rejectedSimilarity: rejectedCenter ? cosineSimilarity(rejectedCenter, extractMovieVector(movie)) : 0.5,
    }))
    .sort((a, b) => b.likedSimilarity - a.likedSimilarity);

  const anchors = shuffled
    .filter((movie) => (movie.reviewScore ?? 0) >= 8.2 && movie.releaseYear >= 1990)
    .sort((a, b) => (b.reviewScore ?? 0) - (a.reviewScore ?? 0));

  const genreSeen = new Set<string>();
  const genreDiverse = shuffled.filter((movie) => {
    if (genreSeen.has(movie.genrePrimary)) return false;
    genreSeen.add(movie.genrePrimary);
    return true;
  });

  const eraSeen = new Set<number>();
  const eraDiverse = shuffled.filter((movie) => {
    const decade = Math.floor(movie.releaseYear / 10);
    if (eraSeen.has(decade)) return false;
    eraSeen.add(decade);
    return true;
  });

  const tasteAdjacent = similaritySorted
    .filter((item) => item.likedSimilarity >= 0.72 && item.rejectedSimilarity <= 0.78)
    .map((item) => item.movie);
  const boundaryTest = similaritySorted
    .filter((item) => item.likedSimilarity >= 0.5 && item.likedSimilarity < 0.66)
    .map((item) => item.movie);
  const exploratory = similaritySorted
    .filter((item) => item.likedSimilarity < 0.55 && (item.movie.reviewScore ?? 0) >= 6.5)
    .map((item) => item.movie);

  const selected: QuickCandidateItem[] = [];
  const selectedMovieIds = new Set<string>();
  const maxCount = Math.max(1, Math.min(args.limit, 30));
  const pools: Array<{ movies: CandidateMovie[]; bucket: BucketName }> = [
    { movies: anchors, bucket: "anchor" },
    { movies: genreDiverse, bucket: "genre_diverse" },
    { movies: eraDiverse, bucket: "era_diverse" },
    { movies: tasteAdjacent, bucket: "taste_adjacent" },
    { movies: boundaryTest, bucket: "boundary_test" },
    { movies: exploratory, bucket: "exploratory" },
  ];

  while (selected.length < maxCount) {
    let appended = false;
    for (const pool of pools) {
      const before = selected.length;
      pickUnique(selected, pool.movies, pool.bucket, selectedMovieIds, maxCount);
      if (selected.length > before) {
        appended = true;
      }
      if (selected.length >= maxCount) break;
    }
    if (!appended) break;
  }

  return {
    items: selected.slice(0, maxCount),
    strategyMeta: {
      servedCount: selected.length,
      excludedCount: args.movies.length - eligible.length,
    },
  };
}
