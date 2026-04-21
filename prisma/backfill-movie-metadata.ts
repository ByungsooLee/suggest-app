import { PrismaClient } from "@prisma/client";
import { resolveStrictMoviePoster } from "../src/lib/movies/strict-movie-poster-match";

const prisma = new PrismaClient();

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function isPlaceholderImage(url: string | null) {
  if (!url) return true;
  return url.includes("picsum.photos");
}

const realPersonMetadata: Record<
  string,
  {
    directors: string[];
    cast: string[];
  }
> = {
  "In the Mood for Love": { directors: ["Wong Kar-wai"], cast: ["Tony Leung", "Maggie Cheung"] },
  "Before Sunrise": { directors: ["Richard Linklater"], cast: ["Ethan Hawke", "Julie Delpy"] },
  "Her": { directors: ["Spike Jonze"], cast: ["Joaquin Phoenix", "Scarlett Johansson", "Amy Adams"] },
  "Past Lives": { directors: ["Celine Song"], cast: ["Greta Lee", "Teo Yoo"] },
  "Lost in Translation": { directors: ["Sofia Coppola"], cast: ["Bill Murray", "Scarlett Johansson"] },
  "Call Me by Your Name": { directors: ["Luca Guadagnino"], cast: ["Timothee Chalamet", "Armie Hammer"] },
  "La La Land": { directors: ["Damien Chazelle"], cast: ["Ryan Gosling", "Emma Stone"] },
  "Sing Street": { directors: ["John Carney"], cast: ["Ferdia Walsh-Peelo", "Lucy Boynton"] },
  "The Grand Budapest Hotel": { directors: ["Wes Anderson"], cast: ["Ralph Fiennes", "Tony Revolori"] },
  "Spider-Man: Into the Spider-Verse": { directors: ["Bob Persichetti", "Peter Ramsey", "Rodney Rothman"], cast: ["Shameik Moore", "Jake Johnson"] },
  "Knives Out": { directors: ["Rian Johnson"], cast: ["Daniel Craig", "Ana de Armas"] },
  "Blade Runner 2049": { directors: ["Denis Villeneuve"], cast: ["Ryan Gosling", "Harrison Ford"] },
  "Drive": { directors: ["Nicolas Winding Refn"], cast: ["Ryan Gosling", "Carey Mulligan"] },
  "Nightcrawler": { directors: ["Dan Gilroy"], cast: ["Jake Gyllenhaal", "Rene Russo"] },
  "The Batman": { directors: ["Matt Reeves"], cast: ["Robert Pattinson", "Zoë Kravitz"] },
  "The Social Network": { directors: ["David Fincher"], cast: ["Jesse Eisenberg", "Andrew Garfield"] },
  "Prisoners": { directors: ["Denis Villeneuve"], cast: ["Hugh Jackman", "Jake Gyllenhaal"] },
  "Zodiac": { directors: ["David Fincher"], cast: ["Jake Gyllenhaal", "Robert Downey Jr."] },
  "Se7en": { directors: ["David Fincher"], cast: ["Brad Pitt", "Morgan Freeman"] },
  "Memories of Murder": { directors: ["Bong Joon-ho"], cast: ["Song Kang-ho", "Kim Sang-kyung"] },
  "The Prestige": { directors: ["Christopher Nolan"], cast: ["Hugh Jackman", "Christian Bale"] },
  "Arrival": { directors: ["Denis Villeneuve"], cast: ["Amy Adams", "Jeremy Renner"] },
  "Ex Machina": { directors: ["Alex Garland"], cast: ["Alicia Vikander", "Domhnall Gleeson"] },
  "The Martian": { directors: ["Ridley Scott"], cast: ["Matt Damon", "Jessica Chastain"] },
  "Interstellar": { directors: ["Christopher Nolan"], cast: ["Matthew McConaughey", "Anne Hathaway"] },
  "Whiplash": { directors: ["Damien Chazelle"], cast: ["Miles Teller", "J.K. Simmons"] },
  "Birdman": { directors: ["Alejandro G. Inarritu"], cast: ["Michael Keaton", "Edward Norton"] },
  "Little Miss Sunshine": { directors: ["Jonathan Dayton", "Valerie Faris"], cast: ["Abigail Breslin", "Steve Carell"] },
  "About Time": { directors: ["Richard Curtis"], cast: ["Domhnall Gleeson", "Rachel McAdams"] },
  "Amelie": { directors: ["Jean-Pierre Jeunet"], cast: ["Audrey Tautou", "Mathieu Kassovitz"] },
  "Moonlight": { directors: ["Barry Jenkins"], cast: ["Trevante Rhodes", "Mahershala Ali"] },
  "Lady Bird": { directors: ["Greta Gerwig"], cast: ["Saoirse Ronan", "Laurie Metcalf"] },
  "The Farewell": { directors: ["Lulu Wang"], cast: ["Awkwafina", "Zhao Shuzhen"] },
  "Jojo Rabbit": { directors: ["Taika Waititi"], cast: ["Roman Griffin Davis", "Thomasin McKenzie"] },
  "Baby Driver": { directors: ["Edgar Wright"], cast: ["Ansel Elgort", "Lily James"] },
  "Heat": { directors: ["Michael Mann"], cast: ["Al Pacino", "Robert De Niro"] },
  "Edge of Tomorrow": { directors: ["Doug Liman"], cast: ["Tom Cruise", "Emily Blunt"] },
  "School of Rock": { directors: ["Richard Linklater"], cast: ["Jack Black", "Joan Cusack"] },
};

async function main() {
  const movies = await prisma.movie.findMany({
    include: { availabilities: true },
  });

  for (const movie of movies) {
    const slug = slugify(movie.title);
    const posterMatch = await resolveStrictMoviePoster({
      title: movie.title,
      releaseYear: movie.releaseYear,
    });
    const posterUrl = posterMatch.matched ? posterMatch.posterUrl : isPlaceholderImage(movie.posterUrl) ? null : movie.posterUrl;
    await prisma.movie.update({
      where: { id: movie.id },
      data: {
        overview: movie.overview ?? `${movie.genrePrimary}テイストで今夜の気分に合わせやすい作品です。`,
        posterUrl,
        backdropUrl: null,
        directors: movie.directors.length && !movie.directors[0]?.toLowerCase().startsWith("unknown ")
          ? movie.directors
          : realPersonMetadata[movie.title]?.directors ?? ["Unknown Director"],
        cast: movie.cast.length && !movie.cast[0]?.toLowerCase().startsWith("unknown ")
          ? movie.cast
          : realPersonMetadata[movie.title]?.cast ?? ["Unknown Cast A", "Unknown Cast B"],
        reviewScore: movie.reviewScore ?? 7.0,
        reviewSummary: movie.reviewSummary ?? "評価の安定した作品です。",
        reviewSource: movie.reviewSource ?? "internal_editorial",
      },
    });

    if (movie.availabilities.length === 0) {
      await prisma.movieAvailability.createMany({
        data: [
          {
            movieId: movie.id,
            provider: "netflix",
            region: "KR",
            url: `https://example.com/watch/netflix/${slug}`,
            lastSyncedAt: new Date(),
          },
          {
            movieId: movie.id,
            provider: "amazon_prime",
            region: "KR",
            url: `https://example.com/watch/amazon_prime/${slug}`,
            lastSyncedAt: new Date(),
          },
        ],
      });
    }
  }

  console.log(`Backfilled ${movies.length} movies.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
