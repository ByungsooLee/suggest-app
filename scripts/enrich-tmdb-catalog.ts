/**
 * Low-impact TMDB catalog enrichment.
 *
 * Usage:
 *   npm run db:enrich:tmdb -- --dry-run
 *   npm run db:enrich:tmdb -- --max-movies 120 --include-tv --max-tv 60
 *
 * Goals:
 * - Add more movie and TV-series candidates without hammering TMDB.
 * - Backfill structured director / actor / writer MovieCredit rows.
 * - Preserve existing app schema by storing TV series in Movie with metadata.mediaType = "tv".
 */

import { PrismaClient, type PersonRole, type Prisma } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const TMDB_KEY = process.env["TMDB_API_KEY"]?.trim() ?? "";
const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_W342 = "https://image.tmdb.org/t/p/w342";
const IMG_W780 = "https://image.tmdb.org/t/p/w780";

type MediaType = "movie" | "tv";

type Args = {
  dryRun: boolean;
  includeTv: boolean;
  forceCredits: boolean;
  maxMovies: number;
  maxTv: number;
  pages: number;
  delayMs: number;
  minVotes: number;
  langs: string[];
};

const args = parseArgs(process.argv.slice(2));

if (!TMDB_KEY) {
  console.error("TMDB_API_KEY is not set in .env");
  process.exit(1);
}

type TmdbMovieListItem = {
  id: number;
  title: string;
  release_date?: string;
  vote_average: number;
  vote_count: number;
};

type TmdbTvListItem = {
  id: number;
  name: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
};

type TmdbMovieDetail = {
  id: number;
  title: string;
  release_date?: string;
  runtime: number | null;
  genres: { id: number; name: string }[];
  vote_average: number;
  vote_count: number;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  original_language: string;
  status: string;
};

type TmdbTvDetail = {
  id: number;
  name: string;
  first_air_date?: string;
  episode_run_time: number[];
  genres: { id: number; name: string }[];
  vote_average: number;
  vote_count: number;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  original_language: string;
  status: string;
  number_of_seasons: number;
  number_of_episodes: number;
  created_by: Array<{ id: number; name: string; profile_path: string | null }>;
};

type TmdbMovieCredits = {
  cast: Array<{ id: number; name: string; order: number; character?: string; profile_path?: string | null }>;
  crew: Array<{ id: number; name: string; job: string; department: string; profile_path?: string | null }>;
};

type TmdbTvAggregateCredits = {
  cast: Array<{
    id: number;
    name: string;
    order: number;
    profile_path?: string | null;
    roles?: Array<{ character?: string; episode_count?: number }>;
    total_episode_count?: number;
  }>;
  crew: Array<{
    id: number;
    name: string;
    department: string;
    profile_path?: string | null;
    jobs?: Array<{ job: string; episode_count?: number }>;
    total_episode_count?: number;
  }>;
};

type CreditInput = {
  tmdbId: number;
  name: string;
  role: PersonRole;
  job: string | null;
  creditOrder: number;
  character?: string | null;
  profilePath?: string | null;
  knownForDepartment?: string | null;
};

type CatalogInput = {
  mediaType: MediaType;
  tmdbId: number;
  title: string;
  releaseYear: number;
  runtimeMinutes: number;
  genreIds: number[];
  originalLanguage: string;
  posterPath: string | null;
  backdropPath: string | null;
  overview: string | null;
  voteAverage: number;
  voteCount: number;
  metadata?: Record<string, unknown>;
};

const MOVIE_GENRE_MAP: Record<number, string> = {
  28: "action",
  12: "adventure",
  16: "animation",
  35: "comedy",
  80: "crime",
  18: "drama",
  10751: "family",
  14: "fantasy",
  27: "horror",
  9648: "mystery",
  10402: "musical",
  10749: "romance",
  878: "sci-fi",
  53: "thriller",
  36: "drama",
  10752: "drama",
  37: "action",
  10770: "drama",
};

const TV_GENRE_MAP: Record<number, string> = {
  10759: "action",
  16: "animation",
  35: "comedy",
  80: "crime",
  99: "drama",
  18: "drama",
  10751: "family",
  10762: "family",
  9648: "mystery",
  10765: "sci-fi",
  10766: "drama",
  10768: "drama",
  37: "action",
};

const TV_GENRES_TO_SKIP = new Set([10763, 10764, 10767]);
const VALID_GENRES = new Set([
  "action",
  "adventure",
  "animation",
  "comedy",
  "crime",
  "drama",
  "family",
  "fantasy",
  "horror",
  "mystery",
  "musical",
  "romance",
  "sci-fi",
  "thriller",
]);

const WRITING_JOB_PRIORITY = new Map<string, number>([
  ["Writer", 0],
  ["Screenplay", 1],
  ["Teleplay", 2],
  ["Written by", 3],
  ["Story", 4],
  ["Original Story", 5],
  ["Creator", 6],
  ["Characters", 7],
  ["Novel", 8],
  ["Book", 9],
  ["Theatre Play", 10],
]);

function parseArgs(raw: string[]): Args {
  const valueAfter = (name: string, fallback: string) => {
    const index = raw.indexOf(name);
    return index >= 0 && raw[index + 1] ? raw[index + 1]! : fallback;
  };
  const langs = ["ja", "ko", "fr"];
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === "--lang" && raw[i + 1]) langs.push(raw[i + 1]!);
  }
  return {
    dryRun: raw.includes("--dry-run"),
    includeTv: raw.includes("--include-tv"),
    forceCredits: raw.includes("--force-credits"),
    maxMovies: Number(valueAfter("--max-movies", "80")),
    maxTv: Number(valueAfter("--max-tv", "40")),
    pages: Number(valueAfter("--pages", "3")),
    delayMs: Number(valueAfter("--delay-ms", "350")),
    minVotes: Number(valueAfter("--min-votes", "150")),
    langs: Array.from(new Set(langs.map((lang) => lang.trim()).filter(Boolean))),
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function tmdbGet<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", TMDB_KEY);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(url.toString());
    if (response.status === 429) {
      const retryAfter = Number(response.headers.get("Retry-After") ?? 2);
      await sleep((retryAfter + 1) * 1000);
      continue;
    }
    if (!response.ok) {
      throw new Error(`TMDB ${response.status}: ${path}`);
    }
    await sleep(args.delayMs);
    return response.json() as Promise<T>;
  }

  throw new Error(`TMDB failed after retries: ${path}`);
}

function releaseYearFromDate(value: string | undefined) {
  const year = Number(value?.slice(0, 4));
  return Number.isInteger(year) && year > 0 ? year : null;
}

function normalizeName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function isWritingCredit(job: string, department: string) {
  if (department === "Writing") return true;
  return WRITING_JOB_PRIORITY.has(job);
}

function writingPriority(job: string) {
  return WRITING_JOB_PRIORITY.get(job) ?? 99;
}

function uniqueCredits(credits: CreditInput[], max: number) {
  const seen = new Set<string>();
  const result: CreditInput[] = [];
  for (const credit of credits) {
    const key = `${credit.role}:${credit.tmdbId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(credit);
    if (result.length >= max) break;
  }
  return result;
}

function mapGenres(mediaType: MediaType, genreIds: number[]) {
  const source = mediaType === "tv" ? TV_GENRE_MAP : MOVIE_GENRE_MAP;
  const genreStrings = genreIds.map((id) => source[id]).filter((genre): genre is string => Boolean(genre));
  const genrePrimary = genreStrings.find((genre) => VALID_GENRES.has(genre)) ?? "drama";
  const genreSecondary = genreStrings.find((genre) => genre !== genrePrimary && VALID_GENRES.has(genre)) ?? null;
  return { genrePrimary, genreSecondary };
}

function vectorFromGenres(genreIds: number[]) {
  if (genreIds.includes(27) || genreIds.includes(53)) {
    return { moodCalm: 0.18, moodDark: 0.76, moodEmotional: 0.5, moodUplifting: 0.18, toneStylish: 0.6, toneFunny: 0.06, paceFast: 0.48, paceSlowBurn: 0.7, complexity: 0.82, emotionalWeight: 0.66, tension: 0.86, accessibility: 0.38 };
  }
  if (genreIds.includes(80)) {
    return { moodCalm: 0.25, moodDark: 0.82, moodEmotional: 0.56, moodUplifting: 0.2, toneStylish: 0.9, toneFunny: 0.08, paceFast: 0.34, paceSlowBurn: 0.72, complexity: 0.7, emotionalWeight: 0.68, tension: 0.74, accessibility: 0.34 };
  }
  if (genreIds.includes(35) || genreIds.includes(10751) || genreIds.includes(10762)) {
    return { moodCalm: 0.62, moodDark: 0.08, moodEmotional: 0.44, moodUplifting: 0.82, toneStylish: 0.58, toneFunny: 0.88, paceFast: 0.66, paceSlowBurn: 0.2, complexity: 0.28, emotionalWeight: 0.32, tension: 0.24, accessibility: 0.92 };
  }
  if (genreIds.includes(10749) || genreIds.includes(18)) {
    return { moodCalm: 0.78, moodDark: 0.2, moodEmotional: 0.84, moodUplifting: 0.52, toneStylish: 0.7, toneFunny: 0.2, paceFast: 0.32, paceSlowBurn: 0.66, complexity: 0.45, emotionalWeight: 0.8, tension: 0.28, accessibility: 0.72 };
  }
  return { moodCalm: 0.5, moodDark: 0.35, moodEmotional: 0.56, moodUplifting: 0.58, toneStylish: 0.62, toneFunny: 0.4, paceFast: 0.52, paceSlowBurn: 0.48, complexity: 0.46, emotionalWeight: 0.52, tension: 0.5, accessibility: 0.64 };
}

function moodTagsFromGenres(genreIds: number[], mediaType: MediaType) {
  const tags = new Set<string>();
  if (genreIds.includes(27) || genreIds.includes(53) || genreIds.includes(80)) tags.add("tense");
  if (genreIds.includes(27) || genreIds.includes(80)) tags.add("dark");
  if (genreIds.includes(35)) tags.add("funny");
  if (genreIds.includes(35) || genreIds.includes(10751) || genreIds.includes(10762)) tags.add("uplifting");
  if (genreIds.includes(10749) || genreIds.includes(18)) tags.add("emotional");
  if (genreIds.includes(878) || genreIds.includes(10765) || genreIds.includes(9648)) tags.add("complex_plot");
  if (mediaType === "tv") tags.add("easy_to_watch");
  if (tags.size === 0) tags.add("easy_to_watch");
  return [...tags].slice(0, 4);
}

function watchContextsFromGenres(genreIds: number[]) {
  const contexts = new Set<string>();
  if (genreIds.includes(35) || genreIds.includes(10751) || genreIds.includes(10762) || genreIds.includes(16)) {
    contexts.add("friends_hangout");
    contexts.add("family_time");
  }
  if (genreIds.includes(10749) || genreIds.includes(18)) {
    contexts.add("date_friendly");
    contexts.add("solo_watch");
  }
  if (genreIds.includes(27) || genreIds.includes(53) || genreIds.includes(80)) {
    contexts.add("solo_watch");
    contexts.add("late_night_fit");
  }
  if (contexts.size === 0) contexts.add("solo_watch");
  return [...contexts].slice(0, 3);
}

function contentWarningsFromGenres(genreIds: number[]) {
  const warnings = new Set<string>();
  if (genreIds.includes(27)) {
    warnings.add("violence");
    warnings.add("disturbing");
  }
  if (genreIds.includes(28) || genreIds.includes(53) || genreIds.includes(80)) warnings.add("violence");
  return [...warnings];
}

function providersFromGenre(genre: string) {
  if (genre === "animation" || genre === "family") return ["disney_plus", "netflix"];
  if (genre === "horror" || genre === "thriller") return ["amazon_prime", "netflix"];
  return ["netflix", "amazon_prime"];
}

async function fetchMovieCandidates() {
  const candidates = new Map<number, TmdbMovieListItem>();
  const addPageSet = async (endpoint: "/movie/top_rated" | "/movie/popular" | "/discover/movie", params: Record<string, string | number>) => {
    for (let page = 1; page <= args.pages; page++) {
      const data = await tmdbGet<{ results: TmdbMovieListItem[]; total_pages: number }>(endpoint, {
        language: "en-US",
        page,
        ...params,
      });
      for (const item of data.results) {
        if (!item.title || !releaseYearFromDate(item.release_date) || item.vote_count < args.minVotes) continue;
        candidates.set(item.id, item);
      }
      if (page >= data.total_pages) break;
    }
  };

  await addPageSet("/movie/top_rated", {});
  await addPageSet("/movie/popular", {});
  for (const lang of args.langs) {
    await addPageSet("/discover/movie", {
      with_original_language: lang,
      sort_by: "vote_average.desc",
      "vote_count.gte": args.minVotes,
    });
  }

  return [...candidates.values()].sort((a, b) => b.vote_average - a.vote_average);
}

async function fetchTvCandidates() {
  const candidates = new Map<number, TmdbTvListItem>();
  const addPageSet = async (endpoint: "/tv/top_rated" | "/tv/popular" | "/discover/tv", params: Record<string, string | number>) => {
    for (let page = 1; page <= args.pages; page++) {
      const data = await tmdbGet<{ results: TmdbTvListItem[]; total_pages: number }>(endpoint, {
        language: "en-US",
        page,
        ...params,
      });
      for (const item of data.results) {
        if (!item.name || !releaseYearFromDate(item.first_air_date) || item.vote_count < args.minVotes) continue;
        if ((item.genre_ids ?? []).some((genreId) => TV_GENRES_TO_SKIP.has(genreId))) continue;
        candidates.set(item.id, item);
      }
      if (page >= data.total_pages) break;
    }
  };

  await addPageSet("/tv/top_rated", {});
  await addPageSet("/tv/popular", {});
  for (const lang of args.langs) {
    await addPageSet("/discover/tv", {
      with_original_language: lang,
      sort_by: "vote_average.desc",
      "vote_count.gte": args.minVotes,
      without_genres: [...TV_GENRES_TO_SKIP].join(","),
    });
  }

  return [...candidates.values()].sort((a, b) => b.vote_average - a.vote_average);
}

async function fetchMovieDetail(tmdbId: number) {
  return tmdbGet<TmdbMovieDetail>(`/movie/${tmdbId}`, { language: "en-US" });
}

async function fetchMovieCredits(tmdbId: number) {
  return tmdbGet<TmdbMovieCredits>(`/movie/${tmdbId}/credits`, { language: "en-US" });
}

async function fetchTvDetail(tmdbId: number) {
  return tmdbGet<TmdbTvDetail>(`/tv/${tmdbId}`, { language: "en-US" });
}

async function fetchTvAggregateCredits(tmdbId: number) {
  return tmdbGet<TmdbTvAggregateCredits>(`/tv/${tmdbId}/aggregate_credits`, { language: "en-US" });
}

function movieCreditsToInputs(credits: TmdbMovieCredits) {
  const directors = uniqueCredits(
    credits.crew
      .filter((credit) => credit.job === "Director")
      .map((credit, index) => ({
        tmdbId: credit.id,
        name: credit.name,
        role: "director" as const,
        job: credit.job,
        creditOrder: index,
        profilePath: credit.profile_path ?? null,
        knownForDepartment: "Directing",
      })),
    4,
  );
  const writers = uniqueCredits(
    credits.crew
      .filter((credit) => isWritingCredit(credit.job, credit.department))
      .sort((a, b) => writingPriority(a.job) - writingPriority(b.job))
      .map((credit, index) => ({
        tmdbId: credit.id,
        name: credit.name,
        role: "writer" as const,
        job: credit.job,
        creditOrder: index,
        profilePath: credit.profile_path ?? null,
        knownForDepartment: "Writing",
      })),
    8,
  );
  const actors = uniqueCredits(
    credits.cast
      .sort((a, b) => a.order - b.order)
      .map((credit, index) => ({
        tmdbId: credit.id,
        name: credit.name,
        role: "actor" as const,
        job: "Actor",
        creditOrder: index,
        character: credit.character ?? null,
        profilePath: credit.profile_path ?? null,
        knownForDepartment: "Acting",
      })),
    10,
  );

  return { directors, writers, actors, all: [...directors, ...writers, ...actors] };
}

function tvCreditsToInputs(detail: TmdbTvDetail, credits: TmdbTvAggregateCredits) {
  const creators = detail.created_by.map((creator, index) => ({
    tmdbId: creator.id,
    name: creator.name,
    role: "writer" as const,
    job: "Creator",
    creditOrder: index,
    profilePath: creator.profile_path,
    knownForDepartment: "Writing",
  }));
  const directors = uniqueCredits(
    credits.crew
      .filter((credit) => credit.department === "Directing")
      .sort((a, b) => (b.total_episode_count ?? 0) - (a.total_episode_count ?? 0))
      .map((credit, index) => ({
        tmdbId: credit.id,
        name: credit.name,
        role: "director" as const,
        job: credit.jobs?.[0]?.job ?? "Director",
        creditOrder: index,
        profilePath: credit.profile_path ?? null,
        knownForDepartment: "Directing",
      })),
    4,
  );
  const writers = uniqueCredits(
    [
      ...creators,
      ...credits.crew
        .filter((credit) => credit.department === "Writing" || (credit.jobs ?? []).some((job) => isWritingCredit(job.job, "Writing")))
        .sort((a, b) => (b.total_episode_count ?? 0) - (a.total_episode_count ?? 0))
        .map((credit, index) => ({
          tmdbId: credit.id,
          name: credit.name,
          role: "writer" as const,
          job: credit.jobs?.sort((a, b) => (b.episode_count ?? 0) - (a.episode_count ?? 0))[0]?.job ?? "Writer",
          creditOrder: creators.length + index,
          profilePath: credit.profile_path ?? null,
          knownForDepartment: "Writing",
        })),
    ],
    8,
  );
  const actors = uniqueCredits(
    credits.cast
      .sort((a, b) => a.order - b.order)
      .map((credit, index) => ({
        tmdbId: credit.id,
        name: credit.name,
        role: "actor" as const,
        job: "Actor",
        creditOrder: index,
        character: credit.roles?.[0]?.character ?? null,
        profilePath: credit.profile_path ?? null,
        knownForDepartment: "Acting",
      })),
    10,
  );

  return { directors, writers, actors, all: [...directors, ...writers, ...actors] };
}

async function upsertPersonCredit(movieId: string, credit: CreditInput) {
  const normalizedName = normalizeName(credit.name);
  const person = await prisma.person.upsert({
    where: { tmdbId: credit.tmdbId },
    update: {
      name: credit.name,
      normalizedName,
      profilePath: credit.profilePath ?? undefined,
      knownForDepartment: credit.knownForDepartment ?? undefined,
    },
    create: {
      name: credit.name,
      normalizedName,
      tmdbId: credit.tmdbId,
      profilePath: credit.profilePath ?? null,
      knownForDepartment: credit.knownForDepartment ?? null,
    },
  });

  await prisma.movieCredit.upsert({
    where: {
      movieId_personId_role: {
        movieId,
        personId: person.id,
        role: credit.role,
      },
    },
    update: {
      creditOrder: credit.creditOrder,
      character: credit.character ?? null,
      job: credit.job,
    },
    create: {
      movieId,
      personId: person.id,
      role: credit.role,
      creditOrder: credit.creditOrder,
      character: credit.character ?? null,
      job: credit.job,
    },
  });
}

async function syncCredits(movieId: string, credits: CreditInput[]) {
  for (const credit of credits) {
    await upsertPersonCredit(movieId, credit);
  }
}

async function upsertCatalogItem(input: CatalogInput, credits: ReturnType<typeof movieCreditsToInputs>) {
  const { genrePrimary, genreSecondary } = mapGenres(input.mediaType, input.genreIds);
  const vector = vectorFromGenres(input.genreIds);
  const providers = providersFromGenre(genrePrimary);
  const posterUrl = input.posterPath ? `${IMG_W342}${input.posterPath}` : null;
  const backdropUrl = input.backdropPath ? `${IMG_W780}${input.backdropPath}` : null;
  const slug = input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const metadata: Record<string, Prisma.InputJsonValue> = {
    ...(input.metadata ?? {}),
    mediaType: input.mediaType,
    source: "tmdb",
    tmdbId: input.tmdbId,
    voteCount: input.voteCount,
    originalLanguage: input.originalLanguage,
    writerJobs: credits.writers.map((credit) => ({ name: credit.name, job: credit.job })),
  };

  if (input.mediaType === "movie") {
    metadata.tmdbMovieId = input.tmdbId;
  } else {
    metadata.tmdbTvId = input.tmdbId;
  }

  const directors = credits.directors.map((credit) => credit.name);
  const cast = credits.actors.map((credit) => credit.name);

  const existingByTmdb = input.mediaType === "movie"
    ? await prisma.movie.findUnique({
        where: { tmdbId: input.tmdbId },
        select: {
          id: true,
          tmdbId: true,
          metadata: true,
          _count: { select: { credits: true } },
        },
      })
    : null;
  const existingByTitleYear = await prisma.movie.findUnique({
    where: { title_releaseYear: { title: input.title, releaseYear: input.releaseYear } },
    select: {
      id: true,
      tmdbId: true,
      metadata: true,
      _count: { select: { credits: true } },
    },
  });
  const existing = existingByTmdb ?? existingByTitleYear;

  if (input.mediaType === "tv" && existing) {
    const existingMeta = existing.metadata && typeof existing.metadata === "object" && !Array.isArray(existing.metadata)
      ? (existing.metadata as Record<string, unknown>)
      : {};
    if (existingMeta.mediaType !== "tv" && existingMeta.tmdbTvId !== input.tmdbId) {
      return { skipped: true, reason: "title-year collision with existing movie" };
    }
  }

  if (args.dryRun) {
    return { skipped: false, id: existing?.id ?? "dry-run" };
  }

  const updateData = {
      runtimeMinutes: input.runtimeMinutes,
      genrePrimary,
      genreSecondary,
      posterUrl,
      backdropUrl,
      overview: input.overview,
      directors,
      cast,
      reviewScore: input.voteAverage > 0 ? Math.round(input.voteAverage * 10) / 10 : null,
      reviewSource: "tmdb",
      moodTags: moodTagsFromGenres(input.genreIds, input.mediaType),
      watchContexts: watchContextsFromGenres(input.genreIds),
      contentWarnings: contentWarningsFromGenres(input.genreIds),
      metadata,
      ...(input.mediaType === "movie" && (!existing || existing.tmdbId === input.tmdbId || existing.tmdbId === null)
        ? { tmdbId: input.tmdbId }
        : {}),
  };

  const movie = existing
    ? await prisma.movie.update({
        where: { id: existing.id },
        data: updateData,
      })
    : await prisma.movie.create({
        data: {
      title: input.title,
      releaseYear: input.releaseYear,
      runtimeMinutes: input.runtimeMinutes,
      genrePrimary,
      genreSecondary,
      posterUrl,
      backdropUrl,
      overview: input.overview,
      directors,
      cast,
      reviewScore: input.voteAverage > 0 ? Math.round(input.voteAverage * 10) / 10 : null,
      reviewSource: "tmdb",
      tmdbId: input.mediaType === "movie" ? input.tmdbId : null,
      ...vector,
      moodTags: moodTagsFromGenres(input.genreIds, input.mediaType),
      watchContexts: watchContextsFromGenres(input.genreIds),
      contentWarnings: contentWarningsFromGenres(input.genreIds),
      metadata,
      availabilities: {
        create: providers.map((provider) => ({
          provider,
          region: "JP",
          url: `https://example.com/watch/${provider}/${slug}`,
          lastSyncedAt: new Date(),
        })),
      },
        },
      });

  if (args.forceCredits || !existing || existing._count.credits === 0) {
    await syncCredits(movie.id, credits.all);
  }

  return { skipped: false, id: movie.id };
}

async function processMovie(item: TmdbMovieListItem) {
  const detail = await fetchMovieDetail(item.id);
  const releaseYear = releaseYearFromDate(detail.release_date);
  if (!releaseYear || detail.status !== "Released") return { skipped: true, reason: "not released" };
  const runtime = detail.runtime ?? 0;
  if (runtime < 60 || runtime > 240) return { skipped: true, reason: "runtime out of range" };

  const credits = movieCreditsToInputs(await fetchMovieCredits(item.id));
  return upsertCatalogItem(
    {
      mediaType: "movie",
      tmdbId: item.id,
      title: detail.title,
      releaseYear,
      runtimeMinutes: runtime,
      genreIds: detail.genres.map((genre) => genre.id),
      originalLanguage: detail.original_language,
      posterPath: detail.poster_path,
      backdropPath: detail.backdrop_path,
      overview: detail.overview || null,
      voteAverage: detail.vote_average,
      voteCount: detail.vote_count,
    },
    credits,
  );
}

async function processTv(item: TmdbTvListItem) {
  const detail = await fetchTvDetail(item.id);
  const releaseYear = releaseYearFromDate(detail.first_air_date);
  if (!releaseYear || detail.status === "Canceled" || detail.status === "Pilot") return { skipped: true, reason: "not eligible" };
  const episodeRuntime = detail.episode_run_time.find((value) => value > 0) ?? 50;
  if (episodeRuntime < 20 || episodeRuntime > 120) return { skipped: true, reason: "episode runtime out of range" };

  const credits = tvCreditsToInputs(detail, await fetchTvAggregateCredits(item.id));
  return upsertCatalogItem(
    {
      mediaType: "tv",
      tmdbId: item.id,
      title: detail.name,
      releaseYear,
      runtimeMinutes: episodeRuntime,
      genreIds: detail.genres.map((genre) => genre.id),
      originalLanguage: detail.original_language,
      posterPath: detail.poster_path,
      backdropPath: detail.backdrop_path,
      overview: detail.overview || null,
      voteAverage: detail.vote_average,
      voteCount: detail.vote_count,
      metadata: {
        numberOfSeasons: detail.number_of_seasons,
        numberOfEpisodes: detail.number_of_episodes,
        episodeRuntime,
        creators: detail.created_by.map((creator) => creator.name),
      },
    },
    credits,
  );
}

async function main() {
  console.log(
    [
      `TMDB enrich${args.dryRun ? " (dry run)" : ""}`,
      `movies=${args.maxMovies}`,
      `tv=${args.includeTv ? args.maxTv : 0}`,
      `pages=${args.pages}`,
      `delayMs=${args.delayMs}`,
      `minVotes=${args.minVotes}`,
    ].join(" | "),
  );

  const movieCandidates = (await fetchMovieCandidates()).slice(0, args.maxMovies);
  let movieTouched = 0;
  let skipped = 0;
  for (const candidate of movieCandidates) {
    const result = await processMovie(candidate);
    if (result.skipped) {
      skipped++;
    } else {
      movieTouched++;
    }
    process.stdout.write(`\rMovies touched: ${movieTouched}/${movieCandidates.length} | skipped: ${skipped}`);
  }

  let tvTouched = 0;
  if (args.includeTv) {
    const tvCandidates = (await fetchTvCandidates()).slice(0, args.maxTv);
    for (const candidate of tvCandidates) {
      const result = await processTv(candidate);
      if (result.skipped) {
        skipped++;
      } else {
        tvTouched++;
      }
      process.stdout.write(`\rMovies touched: ${movieTouched} | TV touched: ${tvTouched}/${tvCandidates.length} | skipped: ${skipped}`);
    }
  }

  const [movies, people, credits, writerCredits] = await Promise.all([
    prisma.movie.count(),
    prisma.person.count(),
    prisma.movieCredit.count(),
    prisma.movieCredit.count({ where: { role: "writer" } }),
  ]);

  console.log(`\nDone. Catalog=${movies} | People=${people} | Credits=${credits} | Writer credits=${writerCredits}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
