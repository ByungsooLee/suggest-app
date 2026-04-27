/**
 * TMDB bulk seeder
 * Usage: npx tsx scripts/seed-tmdb.ts [--max N] [--dry-run]
 *
 * Fetches top-rated + popular movies and Japanese/Korean/French cinema,
 * maps to the app's schema, and upserts into PostgreSQL.
 *
 * Options:
 *   --max N     Stop after N movies inserted (default: 2000)
 *   --dry-run   Print count only, no DB writes
 *   --lang XX   Extra language code to fetch (can repeat), e.g. --lang ja --lang ko
 */

import { PrismaClient, type Prisma } from "@prisma/client";
import * as dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();
const TMDB_KEY = process.env["TMDB_API_KEY"] ?? "";
const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_W342 = "https://image.tmdb.org/t/p/w342";
const IMG_W780 = "https://image.tmdb.org/t/p/w780";

if (!TMDB_KEY) {
  console.error("TMDB_API_KEY is not set in .env");
  process.exit(1);
}

// ─── CLI args ─────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const MAX_MOVIES = Number(args[args.indexOf("--max") + 1] ?? 2000);
const DRY_RUN = args.includes("--dry-run");
const extraLangs: string[] = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--lang" && args[i + 1]) extraLangs.push(args[i + 1]!);
}

// ─── TMDB types ───────────────────────────────────────────────────────────────

type TmdbListMovie = {
  id: number;
  title: string;
  release_date: string;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
  poster_path: string | null;
  overview: string;
  original_language: string;
  runtime?: number;
};

type TmdbMovieDetail = {
  id: number;
  title: string;
  release_date: string;
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

type TmdbCredits = {
  cast: { id: number; name: string; order: number }[];
  crew: { id: number; name: string; job: string; department: string }[];
};

type TmdbKeywords = {
  keywords: { id: number; name: string }[];
};

// ─── Genre mapping ────────────────────────────────────────────────────────────

const GENRE_MAP: Record<number, string> = {
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
  36: "drama",    // history
  10752: "drama", // war
  37: "action",   // western
  10770: "drama", // TV movie
};

const VALID_GENRES = new Set([
  "action", "adventure", "animation", "comedy", "crime", "drama",
  "family", "fantasy", "horror", "mystery", "musical", "romance", "sci-fi", "thriller",
]);

// ─── Feature vector presets ───────────────────────────────────────────────────

type VectorPreset = "calm_emotional" | "dark_stylish" | "fun_light" | "tense_complex" | "balanced";

function vectorFromPreset(preset: VectorPreset) {
  switch (preset) {
    case "calm_emotional":
      return { moodCalm: 0.78, moodDark: 0.2, moodEmotional: 0.84, moodUplifting: 0.52, toneStylish: 0.7, toneFunny: 0.2, paceFast: 0.32, paceSlowBurn: 0.66, complexity: 0.45, emotionalWeight: 0.8, tension: 0.28, accessibility: 0.72 };
    case "dark_stylish":
      return { moodCalm: 0.25, moodDark: 0.82, moodEmotional: 0.56, moodUplifting: 0.2, toneStylish: 0.9, toneFunny: 0.08, paceFast: 0.34, paceSlowBurn: 0.72, complexity: 0.7, emotionalWeight: 0.68, tension: 0.74, accessibility: 0.34 };
    case "fun_light":
      return { moodCalm: 0.62, moodDark: 0.08, moodEmotional: 0.44, moodUplifting: 0.82, toneStylish: 0.58, toneFunny: 0.88, paceFast: 0.66, paceSlowBurn: 0.2, complexity: 0.28, emotionalWeight: 0.32, tension: 0.24, accessibility: 0.92 };
    case "tense_complex":
      return { moodCalm: 0.18, moodDark: 0.76, moodEmotional: 0.5, moodUplifting: 0.18, toneStylish: 0.6, toneFunny: 0.06, paceFast: 0.48, paceSlowBurn: 0.7, complexity: 0.82, emotionalWeight: 0.66, tension: 0.86, accessibility: 0.38 };
    default:
      return { moodCalm: 0.5, moodDark: 0.35, moodEmotional: 0.56, moodUplifting: 0.58, toneStylish: 0.62, toneFunny: 0.4, paceFast: 0.52, paceSlowBurn: 0.48, complexity: 0.46, emotionalWeight: 0.52, tension: 0.5, accessibility: 0.64 };
  }
}

// ─── Mood mapping from genre + keywords ───────────────────────────────────────

const DARK_KEYWORDS = new Set(["murder", "serial killer", "revenge", "corruption", "death", "war", "violence", "crime", "dystopia", "trauma", "abuse"]);
const FUNNY_KEYWORDS = new Set(["comedy", "parody", "satire", "slapstick", "witty", "humour", "humor", "farce"]);
const EMOTIONAL_KEYWORDS = new Set(["grief", "love story", "family", "redemption", "friendship", "loneliness", "loss", "growing up", "heartbreak"]);
const STYLISH_KEYWORDS = new Set(["neo-noir", "stylized", "aesthetic", "visual", "surreal", "artistic", "auteur", "cinematography"]);
const SLOW_KEYWORDS = new Set(["slow burn", "contemplative", "meditative", "slow-paced", "introspective", "art house"]);
const COMPLEX_KEYWORDS = new Set(["plot twist", "non-linear", "mystery", "psychological", "complex", "labyrinthine", "unreliable narrator"]);

function presetFromGenreIds(genreIds: number[]): VectorPreset {
  if (genreIds.includes(27) && genreIds.includes(53)) return "tense_complex";
  if (genreIds.includes(27)) return "tense_complex";
  if (genreIds.includes(53)) return "tense_complex";
  if (genreIds.includes(80)) return "dark_stylish";
  if (genreIds.includes(35) || genreIds.includes(10751)) return "fun_light";
  if (genreIds.includes(10749) || (genreIds.includes(18) && !genreIds.includes(28))) return "calm_emotional";
  if (genreIds.includes(878) || genreIds.includes(9648)) return "dark_stylish";
  if (genreIds.includes(28) || genreIds.includes(12)) return "balanced";
  return "balanced";
}

type ValidMoodTag = "calm" | "emotional" | "stylish" | "dark" | "funny" | "tense" | "uplifting" | "melancholic";
type ValidStyleTag = "easy_to_watch" | "slow_burn" | "complex_plot" | "visual_masterpiece";
type AnyTag = ValidMoodTag | ValidStyleTag;

function tagsFromMovie(
  genreIds: number[],
  keywords: string[],
  lang: string,
): AnyTag[] {
  const kws = new Set(keywords.map((k) => k.toLowerCase()));
  const tags = new Set<AnyTag>();

  // Genre-based
  if (genreIds.includes(27) || genreIds.includes(53)) tags.add("tense");
  if (genreIds.includes(27) || genreIds.includes(80)) tags.add("dark");
  if (genreIds.includes(35)) { tags.add("funny"); tags.add("uplifting"); }
  if (genreIds.includes(10751) || genreIds.includes(16)) tags.add("uplifting");
  if (genreIds.includes(10749)) tags.add("emotional");
  if (genreIds.includes(18)) tags.add("emotional");
  if (genreIds.includes(878)) tags.add("complex_plot");

  // Keyword-based
  for (const kw of kws) {
    if (DARK_KEYWORDS.has(kw)) tags.add("dark");
    if (FUNNY_KEYWORDS.has(kw)) tags.add("funny");
    if (EMOTIONAL_KEYWORDS.has(kw)) tags.add("emotional");
    if (STYLISH_KEYWORDS.has(kw)) tags.add("stylish");
    if (SLOW_KEYWORDS.has(kw)) tags.add("slow_burn");
    if (COMPLEX_KEYWORDS.has(kw)) tags.add("complex_plot");
  }

  // Foreign language films tend to be more art-house
  if (lang !== "en" && !tags.has("funny") && !tags.has("tense")) {
    tags.add("slow_burn");
  }

  // Default
  if (tags.size === 0) tags.add("easy_to_watch");
  if (tags.size <= 2 && !tags.has("funny") && !tags.has("dark")) {
    tags.add("easy_to_watch");
  }

  return [...tags].slice(0, 4);
}

function watchContextsFromGenreIds(genreIds: number[]): string[] {
  const ctxs = new Set<string>();
  if (genreIds.includes(35) || genreIds.includes(10751) || genreIds.includes(16)) {
    ctxs.add("friends_hangout");
    ctxs.add("family_time");
  }
  if (genreIds.includes(10749) || genreIds.includes(18)) {
    ctxs.add("date_friendly");
    ctxs.add("solo_watch");
  }
  if (genreIds.includes(27) || genreIds.includes(53) || genreIds.includes(80)) {
    ctxs.add("solo_watch");
    ctxs.add("late_night_fit");
  }
  if (genreIds.includes(28) || genreIds.includes(12)) {
    ctxs.add("friends_hangout");
  }
  if (ctxs.size === 0) {
    ctxs.add("solo_watch");
    ctxs.add("friends_hangout");
  }
  return [...ctxs].slice(0, 3);
}

function contentWarningsFromGenreIds(genreIds: number[]): string[] {
  const ws = new Set<string>();
  if (genreIds.includes(27)) { ws.add("violence"); ws.add("disturbing"); }
  if (genreIds.includes(53) || genreIds.includes(80)) ws.add("violence");
  if (genreIds.includes(28)) ws.add("violence");
  return [...ws];
}

function providersFromGenre(genre: string): string[] {
  if (genre === "animation" || genre === "family") return ["disney_plus", "netflix"];
  if (genre === "horror" || genre === "thriller") return ["amazon_prime", "netflix"];
  return ["netflix", "amazon_prime"];
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function tmdbGet<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", TMDB_KEY);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url.toString());
    if (res.status === 429) {
      const retry = Number(res.headers.get("Retry-After") ?? 2);
      await sleep((retry + 1) * 1000);
      continue;
    }
    if (!res.ok) throw new Error(`TMDB ${res.status}: ${path}`);
    return res.json() as Promise<T>;
  }
  throw new Error(`TMDB failed after retries: ${path}`);
}

// ─── Fetch movie pages ────────────────────────────────────────────────────────

async function fetchMoviePages(
  endpoint: "/movie/top_rated" | "/movie/popular" | "/discover/movie",
  extraParams: Record<string, string | number>,
  maxPages: number,
): Promise<TmdbListMovie[]> {
  const movies: TmdbListMovie[] = [];
  for (let page = 1; page <= maxPages; page++) {
    try {
      const data = await tmdbGet<{ results: TmdbListMovie[]; total_pages: number }>(
        endpoint,
        { language: "en-US", page, ...extraParams },
      );
      movies.push(...data.results);
      if (page >= data.total_pages) break;
      await sleep(120);
    } catch (e) {
      console.warn(`  page ${page} failed:`, e);
      break;
    }
  }
  return movies;
}

// ─── Fetch movie details ──────────────────────────────────────────────────────

async function fetchDetail(tmdbId: number): Promise<TmdbMovieDetail | null> {
  try {
    const d = await tmdbGet<TmdbMovieDetail>(`/movie/${tmdbId}`, { language: "en-US" });
    await sleep(80);
    return d;
  } catch {
    return null;
  }
}

async function fetchCredits(tmdbId: number): Promise<TmdbCredits> {
  try {
    const c = await tmdbGet<TmdbCredits>(`/movie/${tmdbId}/credits`, { language: "en-US" });
    await sleep(80);
    return c;
  } catch {
    return { cast: [], crew: [] };
  }
}

async function fetchKeywords(tmdbId: number): Promise<string[]> {
  try {
    const k = await tmdbGet<TmdbKeywords>(`/movie/${tmdbId}/keywords`);
    await sleep(80);
    return k.keywords.map((kw) => kw.name.toLowerCase());
  } catch {
    return [];
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`TMDB seeder — max ${MAX_MOVIES} movies${DRY_RUN ? " (DRY RUN)" : ""}`);

  // Get existing movies to skip
  const existing = new Set(
    (await prisma.movie.findMany({ select: { title: true, releaseYear: true } })).map(
      (m) => `${m.title}::${m.releaseYear}`,
    ),
  );
  console.log(`Existing movies in DB: ${existing.size}`);

  // ─── Collect candidate movies ─────────────────────────────────────────────
  const seen = new Set<number>();
  const candidates: TmdbListMovie[] = [];

  function addCandidates(list: TmdbListMovie[]) {
    for (const m of list) {
      if (seen.has(m.id)) continue;
      if (!m.title || !m.release_date) continue;
      if (m.vote_count < 200) continue; // skip obscure films
      seen.add(m.id);
      candidates.push(m);
    }
  }

  console.log("\nFetching top_rated (en)...");
  addCandidates(await fetchMoviePages("/movie/top_rated", {}, 20));

  console.log("Fetching popular (en)...");
  addCandidates(await fetchMoviePages("/movie/popular", {}, 10));

  // Japanese cinema
  console.log("Fetching Japanese cinema...");
  addCandidates(await fetchMoviePages("/discover/movie", {
    with_original_language: "ja",
    sort_by: "vote_average.desc",
    "vote_count.gte": 300,
  }, 10));

  // Korean cinema
  console.log("Fetching Korean cinema...");
  addCandidates(await fetchMoviePages("/discover/movie", {
    with_original_language: "ko",
    sort_by: "vote_average.desc",
    "vote_count.gte": 300,
  }, 10));

  // French cinema
  console.log("Fetching French cinema...");
  addCandidates(await fetchMoviePages("/discover/movie", {
    with_original_language: "fr",
    sort_by: "vote_average.desc",
    "vote_count.gte": 200,
  }, 6));

  // Any extra languages requested
  for (const lang of extraLangs) {
    console.log(`Fetching ${lang} cinema...`);
    addCandidates(await fetchMoviePages("/discover/movie", {
      with_original_language: lang,
      sort_by: "vote_average.desc",
      "vote_count.gte": 200,
    }, 6));
  }

  // Sort by vote_average desc, filter already existing
  candidates.sort((a, b) => b.vote_average - a.vote_average);
  const toProcess = candidates.filter(
    (m) => !existing.has(`${m.title}::${Number(m.release_date?.slice(0, 4))}`),
  );

  console.log(`\nCandidates: ${candidates.length} | New to add: ${toProcess.length}`);
  if (DRY_RUN) {
    console.log("Dry run — exiting.");
    return;
  }

  // ─── Process each movie ───────────────────────────────────────────────────
  let inserted = 0;
  let skipped = 0;

  for (const candidate of toProcess) {
    if (inserted >= MAX_MOVIES) break;

    const releaseYear = Number(candidate.release_date?.slice(0, 4));
    if (!releaseYear || releaseYear < 1950) { skipped++; continue; }

    // Fetch full details
    const detail = await fetchDetail(candidate.id);
    if (!detail) { skipped++; continue; }
    if (detail.status !== "Released") { skipped++; continue; }

    const runtime = detail.runtime ?? 0;
    if (runtime < 60 || runtime > 240) { skipped++; continue; } // skip shorts & epics

    const genreIds = detail.genres.map((g) => g.id);
    const genreStrings = genreIds.map((id) => GENRE_MAP[id]).filter(Boolean);
    const genrePrimary = genreStrings.find((g) => VALID_GENRES.has(g!)) ?? "drama";
    const genreSecondary = genreStrings.find((g, i) => i > 0 && VALID_GENRES.has(g!) && g !== genrePrimary);

    const credits = await fetchCredits(candidate.id);
    const directors = credits.crew
      .filter((c) => c.job === "Director")
      .map((c) => c.name)
      .slice(0, 3);
    const cast = credits.cast
      .sort((a, b) => a.order - b.order)
      .map((c) => c.name)
      .slice(0, 6);

    const keywords = await fetchKeywords(candidate.id);

    const preset = presetFromGenreIds(genreIds);
    const vector = vectorFromPreset(preset);
    const moodTags = tagsFromMovie(genreIds, keywords, detail.original_language);
    const watchContexts = watchContextsFromGenreIds(genreIds);
    const contentWarnings = contentWarningsFromGenreIds(genreIds);
    const providers = providersFromGenre(genrePrimary);

    const posterUrl = detail.poster_path ? `${IMG_W342}${detail.poster_path}` : null;
    const backdropUrl = detail.backdrop_path ? `${IMG_W780}${detail.backdrop_path}` : null;
    const slug = candidate.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    const createInput: Prisma.MovieCreateInput = {
      title: detail.title,
      releaseYear,
      runtimeMinutes: runtime,
      genrePrimary,
      genreSecondary,
      posterUrl,
      backdropUrl,
      overview: detail.overview || null,
      directors: directors.length > 0 ? directors : ["Unknown Director"],
      cast: cast.length > 0 ? cast : [],
      reviewScore: detail.vote_average > 0 ? Math.round(detail.vote_average * 10) / 10 : null,
      reviewSummary: null,
      reviewSource: "tmdb",
      tmdbId: candidate.id,
      ...vector,
      moodTags,
      watchContexts,
      contentWarnings,
      availabilities: {
        create: providers.map((provider) => ({
          provider,
          region: "JP",
          url: `https://example.com/watch/${provider}/${slug}`,
          lastSyncedAt: new Date(),
        })),
      },
    };

    try {
      const movie = await prisma.movie.upsert({
        where: { title_releaseYear: { title: detail.title, releaseYear } },
        update: {
          posterUrl,
          backdropUrl,
          reviewScore: createInput.reviewScore,
          directors: createInput.directors,
          cast: createInput.cast,
          overview: createInput.overview,
          moodTags,
          watchContexts,
          contentWarnings,
        },
        create: createInput,
      });

      // Re-sync availabilities
      await prisma.movieAvailability.deleteMany({ where: { movieId: movie.id } });
      await prisma.movieAvailability.createMany({
        data: providers.map((provider) => ({
          movieId: movie.id,
          provider,
          region: "JP",
          url: `https://example.com/watch/${provider}/${slug}`,
          lastSyncedAt: new Date(),
        })),
      });

      inserted++;
      process.stdout.write(`\r  Inserted: ${inserted} | Skipped: ${skipped}   `);
    } catch (e) {
      console.warn(`\n  Failed to upsert "${detail.title}":`, e);
      skipped++;
    }
  }

  const total = await prisma.movie.count();
  console.log(`\n\nDone. Inserted: ${inserted} | Skipped: ${skipped}`);
  console.log(`Total movies in DB: ${total}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
