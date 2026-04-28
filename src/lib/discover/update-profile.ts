import { prisma } from "@/lib/db/prisma";

type Movie = {
  genrePrimary: string;
  directors: string[];
  credits?: Array<{
    role: "director" | "actor" | "writer";
    person: {
      name: string;
    };
  }>;
  paceSlowBurn: number;
  complexity: number;
  moodDark: number;
};

export async function updateUserMovieProfile(
  userId: string,
  movie: Movie,
  action: "like" | "pass" | "watchlist",
  reasons: string[],
) {
  const profile = await prisma.userMovieProfile.upsert({
    where: { userId },
    create: { userId, genreWeights: {}, directorAffinity: {} },
    update: {},
  });

  const weights = profile.genreWeights as Record<string, number>;
  const directors = profile.directorAffinity as Record<string, number>;
  const writers = profile.writerAffinity as Record<string, number>;

  const delta = action === "like" ? 0.05 : action === "watchlist" ? 0.08 : -0.02;
  const reasonBonus = reasons.includes("genre") ? 0.03 : 0;
  const directorBonus = reasons.includes("director") ? 0.05 : 0;

  const genre = movie.genrePrimary ?? "other";
  weights[genre] = Math.max(0, Math.min(1, (weights[genre] ?? 0.5) + delta + reasonBonus));

  for (const director of movie.directors ?? []) {
    const key = director.toLowerCase().replace(/\s+/g, "_");
    directors[key] = Math.max(0, Math.min(1, (directors[key] ?? 0.5) + delta + directorBonus));
  }

  if (action !== "pass") {
    const writerBonus = reasons.includes("story") ? 0.06 : 0.03;
    const movieWriters = (movie.credits ?? [])
      .filter((credit) => credit.role === "writer")
      .map((credit) => credit.person.name);

    for (const writer of movieWriters) {
      const key = writer.toLowerCase().replace(/\s+/g, "_");
      writers[key] = Math.max(0, Math.min(1, (writers[key] ?? 0.5) + writerBonus));
    }
  }

  // Pace/complexity/dark attribute nudges (only on positive actions)
  const attrDelta = action === "pass" ? -0.01 : 0.02;
  const newSlowPace = Math.max(0, Math.min(1, profile.preferSlowPace + (movie.paceSlowBurn > 0.6 ? attrDelta : -attrDelta * 0.5)));
  const newComplex  = Math.max(0, Math.min(1, profile.preferComplex  + (movie.complexity    > 0.6 ? attrDelta : -attrDelta * 0.5)));
  const newDark     = Math.max(0, Math.min(1, profile.preferDark     + (movie.moodDark      > 0.6 ? attrDelta : -attrDelta * 0.5)));

  await prisma.userMovieProfile.update({
    where: { userId },
    data: {
      genreWeights:     weights,
      directorAffinity: directors,
      writerAffinity:   writers,
      preferSlowPace:   newSlowPace,
      preferComplex:    newComplex,
      preferDark:       newDark,
      totalSwipes:      { increment: 1 },
      totalLikes:       action !== "pass" ? { increment: 1 } : undefined,
    },
  });
}
