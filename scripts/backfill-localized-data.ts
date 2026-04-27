/**
 * Backfill localizedData: { ja, ko, en } × { title, overview, directors, cast }
 *
 * Sources:
 *  - Title + overview: TMDB /movie/{id}/translations
 *  - Directors + cast: TMDB /movie/{id}/credits?language={lang}
 *
 * Usage: npx tsx scripts/backfill-localized-data.ts [--batch N] [--force]
 *   --batch N   process at most N movies (default: all)
 *   --force     re-process movies that already have localizedData
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
const FORCE = args.includes("--force");

type Lang = "ja" | "ko" | "en";

type LocalizedEntry = {
  title?: string;
  overview?: string;
  directors?: string[];
  cast?: string[];
};

type Translation = {
  iso_639_1: string;
  iso_3166_1: string;
  data: { title?: string; overview?: string };
};

type CreditPerson = {
  id: number;
  name: string;
  job?: string;
  department?: string;
  order?: number;
};

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

async function tmdbGet<T>(path: string, params: Record<string, string | number> = {}): Promise<T | null> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", TMDB_KEY);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url.toString());
      if (res.status === 429) { await sleep(3000 * (attempt + 1)); continue; }
      if (!res.ok) return null;
      return res.json() as Promise<T>;
    } catch { await sleep(1000); }
  }
  return null;
}

async function findTmdbId(title: string, year: number): Promise<number | null> {
  const data = await tmdbGet<{ results: { id: number; title: string; release_date: string }[] }>("/search/movie", {
    query: title, include_adult: "false", language: "en-US", year,
  });
  await sleep(100);
  if (!data?.results?.length) return null;
  const exact = data.results.find(
    (r) => r.title.toLowerCase() === title.toLowerCase() && r.release_date?.startsWith(String(year)),
  );
  return (exact ?? data.results[0])?.id ?? null;
}

async function fetchTranslations(tmdbId: number): Promise<Record<Lang, { title?: string; overview?: string }>> {
  const data = await tmdbGet<{ translations: Translation[] }>(`/movie/${tmdbId}/translations`);
  await sleep(80);
  const out: Record<Lang, { title?: string; overview?: string }> = { ja: {}, ko: {}, en: {} };
  if (!data?.translations) return out;

  for (const t of data.translations) {
    const lang = t.iso_639_1 as Lang;
    if (lang !== "ja" && lang !== "ko" && lang !== "en") continue;
    // Prefer US for English, JP for Japanese, KR for Korean
    const preferred = { ja: "JP", ko: "KR", en: "US" }[lang];
    if (t.iso_3166_1 === preferred || !out[lang].title) {
      if (t.data.title?.trim()) out[lang].title = t.data.title;
      if (t.data.overview?.trim()) out[lang].overview = t.data.overview;
    }
  }
  return out;
}

async function fetchCreditsForLang(tmdbId: number, lang: Lang): Promise<{ directors: string[]; cast: string[] }> {
  const data = await tmdbGet<{ crew: CreditPerson[]; cast: CreditPerson[] }>(`/movie/${tmdbId}/credits`, {
    language: lang === "ja" ? "ja-JP" : lang === "ko" ? "ko-KR" : "en-US",
  });
  await sleep(80);
  if (!data) return { directors: [], cast: [] };
  const directors = (data.crew ?? [])
    .filter((c) => c.job === "Director")
    .map((c) => c.name)
    .filter(Boolean)
    .slice(0, 3);
  const cast = (data.cast ?? [])
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
    .map((c) => c.name)
    .filter(Boolean)
    .slice(0, 8);
  return { directors, cast };
}

async function main() {
  const where = FORCE
    ? {}
    : { localizedData: { equals: Prisma.DbNull } };

  const movies = await prisma.movie.findMany({
    where,
    select: { id: true, title: true, releaseYear: true, tmdbId: true },
    orderBy: { reviewScore: "desc" },
    take: BATCH,
  });

  console.log(`Movies to process: ${movies.length}${FORCE ? " (force mode)" : ""}`);

  let done = 0;
  let failed = 0;

  for (const movie of movies) {
    let tmdbId = movie.tmdbId;

    if (!tmdbId) {
      tmdbId = await findTmdbId(movie.title, movie.releaseYear);
      if (tmdbId) {
        try {
          await prisma.movie.update({ where: { id: movie.id }, data: { tmdbId } });
        } catch { tmdbId = null; }
      }
    }

    if (!tmdbId) {
      await prisma.movie.update({
        where: { id: movie.id },
        data: { localizedData: { _notFound: true } },
      });
      failed++;
      process.stdout.write(`\r  Done: ${done} | No TMDB: ${failed}   `);
      continue;
    }

    // Fetch all data in parallel
    const [translations, creditsJa, creditsKo, creditsEn] = await Promise.all([
      fetchTranslations(tmdbId),
      fetchCreditsForLang(tmdbId, "ja"),
      fetchCreditsForLang(tmdbId, "ko"),
      fetchCreditsForLang(tmdbId, "en"),
    ]);

    const localizedData: Record<Lang, LocalizedEntry> = {
      ja: {
        title: translations.ja.title,
        overview: translations.ja.overview,
        directors: creditsJa.directors.length > 0 ? creditsJa.directors : creditsEn.directors,
        cast: creditsJa.cast.length > 0 ? creditsJa.cast : creditsEn.cast,
      },
      ko: {
        title: translations.ko.title,
        overview: translations.ko.overview,
        directors: creditsKo.directors.length > 0 ? creditsKo.directors : creditsEn.directors,
        cast: creditsKo.cast.length > 0 ? creditsKo.cast : creditsEn.cast,
      },
      en: {
        title: translations.en.title || movie.title,
        overview: translations.en.overview,
        directors: creditsEn.directors,
        cast: creditsEn.cast,
      },
    };

    await prisma.movie.update({
      where: { id: movie.id },
      data: { localizedData },
    });

    done++;
    process.stdout.write(`\r  Done: ${done} | No TMDB: ${failed}   `);
  }

  const total = await prisma.movie.count({
    where: { NOT: { localizedData: { equals: Prisma.DbNull } } },
  });
  console.log(`\n\nFinished. Done: ${done} | Failed: ${failed} | Total with data: ${total}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
