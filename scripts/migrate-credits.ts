import { PrismaClient, type PersonRole } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

function normalizePersonName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

async function upsertCreditPeople(
  movieId: string,
  names: string[],
  role: PersonRole,
) {
  for (const [index, rawName] of names.entries()) {
    const name = rawName.trim();
    if (!name) continue;
    const normalizedName = normalizePersonName(name);

    const existingPerson = await prisma.person.findFirst({
      where: {
        normalizedName,
        tmdbId: null,
      },
      select: { id: true },
    });

    const person = existingPerson
      ? await prisma.person.update({
          where: { id: existingPerson.id },
          data: { name },
        })
      : await prisma.person.create({
          data: {
            name,
            normalizedName,
          },
        });

    await prisma.movieCredit.upsert({
      where: {
        movieId_personId_role: {
          movieId,
          personId: person.id,
          role,
        },
      },
      update: {
        creditOrder: index,
        job: role === "director" ? "Director" : role === "writer" ? "Writer" : null,
      },
      create: {
        movieId,
        personId: person.id,
        role,
        creditOrder: index,
        job: role === "director" ? "Director" : role === "writer" ? "Writer" : null,
      },
    });
  }
}

async function main() {
  const movies = await prisma.movie.findMany({
    select: {
      id: true,
      title: true,
      releaseYear: true,
      directors: true,
      cast: true,
    },
    orderBy: [{ releaseYear: "desc" }, { title: "asc" }],
  });

  console.log(`Migrating credits for ${movies.length} movies...`);

  let processed = 0;
  for (const movie of movies) {
    await upsertCreditPeople(movie.id, movie.directors ?? [], "director");
    await upsertCreditPeople(movie.id, movie.cast ?? [], "actor");
    processed += 1;

    if (processed % 50 === 0 || processed === movies.length) {
      process.stdout.write(`\rProcessed ${processed}/${movies.length}`);
    }
  }

  console.log("\nDone.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
