/**
 * Backfill writer (screenplay) credits for movies that were imported via seed-tmdb.ts
 * and are missing writer credits in MovieCredit table.
 *
 * Usage:
 *   npm run db:backfill:writers
 *   npm run db:backfill:writers -- --dry-run
 *   npm run db:backfill:writers -- --max 100
 */

import { PrismaClient, type PersonRole } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const TMDB_KEY = process.env["TMDB_API_KEY"]?.trim() ?? "";
const TMDB_BASE = "https://api.themoviedb.org/3";

if (!TMDB_KEY) {
  console.error("TMDB_API_KEY is not set in .env");
  process.exit(1);
}

const rawArgs = process.argv.slice(2);
const dryRun = rawArgs.includes("--dry-run");
const maxArg = rawArgs.indexOf("--max");
const maxMovies = maxArg >= 0 && rawArgs[maxArg + 1] ? Number(rawArgs[maxArg + 1]) : Infinity;
const delayMs = 300;

// WRITING_JOB_PRIORITY matches enrich-tmdb-catalog.ts
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

type TmdbCrewMember = {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
};

type TmdbCredits = {
  cast: Array<{ id: number; name: string; order: number }>;
  crew: TmdbCrewMember[];
};

function isWritingCredit(job: string, department: string) {
  if (department === "Writing") return true;
  return WRITING_JOB_PRIORITY.has(job);
}

function writingPriority(job: string) {
  return WRITING_JOB_PRIORITY.get(job) ?? 99;
}

function normalizeName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function tmdbGet<T>(path: string): Promise<T | null> {
  const url = `${TMDB_BASE}${path}?api_key=${TMDB_KEY}&language=en-US`;
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url);
    if (res.status === 429) {
      const retryAfter = Number(res.headers.get("Retry-After") ?? 2);
      await sleep((retryAfter + 1) * 1000);
      continue;
    }
    if (!res.ok) return null;
    await sleep(delayMs);
    return res.json() as Promise<T>;
  }
  return null;
}

async function upsertWriterCredit(movieId: string, crew: TmdbCrewMember, creditOrder: number) {
  const normalizedName = normalizeName(crew.name);

  const person = await prisma.person.upsert({
    where: { tmdbId: crew.id },
    update: {
      name: crew.name,
      normalizedName,
      ...(crew.profile_path ? { profilePath: crew.profile_path } : {}),
      knownForDepartment: "Writing",
    },
    create: {
      name: crew.name,
      normalizedName,
      tmdbId: crew.id,
      profilePath: crew.profile_path,
      knownForDepartment: "Writing",
    },
  });

  await prisma.movieCredit.upsert({
    where: {
      movieId_personId_role: { movieId, personId: person.id, role: "writer" as PersonRole },
    },
    update: { creditOrder, job: crew.job },
    create: {
      movieId,
      personId: person.id,
      role: "writer",
      creditOrder,
      job: crew.job,
    },
  });
}

async function main() {
  console.log(`Backfill writer credits${dryRun ? " (dry run)" : ""} | max=${maxMovies}`);

  const movies = await prisma.movie.findMany({
    where: {
      tmdbId: { not: null },
      credits: { none: { role: "writer" } },
    },
    select: { id: true, title: true, tmdbId: true },
    orderBy: { reviewScore: "desc" },
    ...(Number.isFinite(maxMovies) ? { take: maxMovies } : {}),
  });

  console.log(`Found ${movies.length} movies needing writer credits`);

  let done = 0;
  let noWriters = 0;
  let failed = 0;

  for (const movie of movies) {
    const credits = await tmdbGet<TmdbCredits>(`/movie/${movie.tmdbId}/credits`);
    if (!credits) {
      failed++;
      process.stdout.write(`\r  Done: ${done} | No writers: ${noWriters} | Failed: ${failed}   `);
      continue;
    }

    const writers = credits.crew
      .filter((c) => isWritingCredit(c.job, c.department))
      .sort((a, b) => writingPriority(a.job) - writingPriority(b.job));

    // Deduplicate by TMDB person ID
    const seen = new Set<number>();
    const unique = writers.filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    }).slice(0, 8);

    if (unique.length === 0) {
      noWriters++;
      process.stdout.write(`\r  Done: ${done} | No writers: ${noWriters} | Failed: ${failed}   `);
      continue;
    }

    if (!dryRun) {
      for (let i = 0; i < unique.length; i++) {
        await upsertWriterCredit(movie.id, unique[i]!, i);
      }
    }

    done++;
    process.stdout.write(`\r  Done: ${done} | No writers: ${noWriters} | Failed: ${failed}   `);
  }

  const writerTotal = await prisma.movieCredit.count({ where: { role: "writer" } });
  console.log(`\nFinished. Writer credits in DB: ${writerTotal}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
