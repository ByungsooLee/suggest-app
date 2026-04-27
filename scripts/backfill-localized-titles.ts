/**
 * Backfill localized titles (ja / ko / en) for all movies.
 *
 * Strategy:
 *   1. For movies that already have tmdbId → fetch /movie/{id}/translations directly
 *   2. For movies without tmdbId → search TMDB by title+year, get ID, then fetch translations
 *
 * Usage: npx tsx scripts/backfill-localized-titles.ts [--batch N]
 *   --batch N   process N movies per run (default: all)
 */

import { PrismaClient, Prisma } from "@prisma/client";
import * as dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();
const TMDB_KEY = process.env["TMDB_API_KEY"] ?? "";
const TMDB_BASE = "https://api.themoviedb.org/3";

if (!TMDB_KEY) { console.error("TMDB_API_KEY missing"); process.exit(1); }

const args = process.argv.slice(2);
const BATCH = Number(args[args.indexOf("--batch") + 1] ?? 99999);

// ─── Types ────────────────────────────────────────────────────────────────────

type Translation = {
  iso_639_1: string;
  iso_3166_1: string;
  data: { title?: string; overview?: string };
};

type SearchResult = {
  id: number;
  title: string;
  release_date: string;
};

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function tmdbGet<T>(path: string, params: Record<string, string | number> = {}): Promise<T | null> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", TMDB_KEY);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url.toString());
      if (res.status === 429) {
        await sleep(3000 * (attempt + 1));
        continue;
      }
      if (!res.ok) return null;
      return res.json() as Promise<T>;
    } catch {
      await sleep(1000);
    }
  }
  return null;
}

// ─── Core helpers ─────────────────────────────────────────────────────────────

async function findTmdbId(title: string, year: number): Promise<number | null> {
  const data = await tmdbGet<{ results: SearchResult[] }>("/search/movie", {
    query: title,
    include_adult: "false",
    language: "en-US",
    year,
  });
  await sleep(100);
  if (!data?.results?.length) return null;

  // Prefer exact title+year match
  const exact = data.results.find(
    (r) => r.title.toLowerCase() === title.toLowerCase() &&
           r.release_date?.startsWith(String(year)),
  );
  return (exact ?? data.results[0])?.id ?? null;
}

async function fetchLocalizedTitles(tmdbId: number): Promise<Record<string, string>> {
  const data = await tmdbGet<{ translations: Translation[] }>(`/movie/${tmdbId}/translations`);
  await sleep(100);
  if (!data?.translations) return {};

  const result: Record<string, string> = {};

  // English title (fallback: already stored)
  const enTrans = data.translations.find(
    (t) => t.iso_639_1 === "en" && t.iso_3166_1 === "US" && t.data.title,
  ) ?? data.translations.find((t) => t.iso_639_1 === "en" && t.data.title);
  if (enTrans?.data.title) result["en"] = enTrans.data.title;

  // Japanese title
  const jaTrans = data.translations.find(
    (t) => t.iso_639_1 === "ja" && t.data.title,
  );
  if (jaTrans?.data.title) result["ja"] = jaTrans.data.title;

  // Korean title
  const koTrans = data.translations.find(
    (t) => t.iso_639_1 === "ko" && t.data.title,
  );
  if (koTrans?.data.title) result["ko"] = koTrans.data.title;

  return result;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const movies = await prisma.movie.findMany({
    where: { localizedTitles: { equals: Prisma.DbNull } },
    select: { id: true, title: true, releaseYear: true, tmdbId: true },
    orderBy: { reviewScore: "desc" },
    take: BATCH,
  });

  console.log(`Movies to process: ${movies.length}`);

  let done = 0;
  let failed = 0;
  let noJa = 0;

  for (const movie of movies) {
    let tmdbId = movie.tmdbId;

    // Step 1: find TMDB ID if missing
    if (!tmdbId) {
      tmdbId = await findTmdbId(movie.title, movie.releaseYear);
      if (tmdbId) {
        // Store it for future use (ignore unique constraint conflicts)
        try {
          await prisma.movie.update({
            where: { id: movie.id },
            data: { tmdbId },
          });
        } catch {
          // Another movie may already have this tmdbId
          tmdbId = null;
        }
      }
    }

    if (!tmdbId) {
      // Still no ID — store empty object so we don't retry
      await prisma.movie.update({
        where: { id: movie.id },
        data: { localizedTitles: { _notFound: true } },
      });
      failed++;
      process.stdout.write(`\r  Done: ${done} | No TMDB: ${failed} | No JA: ${noJa}   `);
      continue;
    }

    // Step 2: fetch translations
    const titles = await fetchLocalizedTitles(tmdbId);

    // Always store English as fallback
    if (!titles["en"]) titles["en"] = movie.title;

    if (!titles["ja"]) noJa++;

    await prisma.movie.update({
      where: { id: movie.id },
      data: { localizedTitles: titles },
    });

    done++;
    process.stdout.write(`\r  Done: ${done} | No TMDB: ${failed} | No JA: ${noJa}   `);
  }

  const total = await prisma.movie.count({ where: { NOT: { localizedTitles: { equals: Prisma.DbNull } } } });
  console.log(`\n\nFinished. Processed: ${done + failed} | With translations: ${done} | Total with data: ${total}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
