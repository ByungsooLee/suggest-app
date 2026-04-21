import { PrismaClient, type Prisma } from "@prisma/client";

import {
  CONTENT_WARNING_TAGS,
  MOOD_TAGS,
  STYLE_TAGS,
  WATCH_CONTEXTS,
  type ContentWarningTag,
  type MoodTag,
  type StyleTag,
  type WatchContext,
} from "../src/lib/constants/taxonomy";

const prisma = new PrismaClient();

type VectorPreset = "calm_emotional" | "dark_stylish" | "fun_light" | "tense_complex" | "balanced";

type MovieSeed = {
  title: string;
  releaseYear: number;
  runtimeMinutes: number;
  genrePrimary: string;
  genreSecondary?: string;
  preset: VectorPreset;
  moodTags: Array<MoodTag | StyleTag>;
  watchContexts: WatchContext[];
  contentWarnings: ContentWarningTag[];
};

const moodSet = new Set(MOOD_TAGS);
const styleSet = new Set(STYLE_TAGS);
const warningSet = new Set(CONTENT_WARNING_TAGS);
const contextSet = new Set(WATCH_CONTEXTS);

function vectorFromPreset(preset: VectorPreset) {
  if (preset === "calm_emotional") {
    return {
      moodCalm: 0.78,
      moodDark: 0.2,
      moodEmotional: 0.84,
      toneStylish: 0.7,
      toneFunny: 0.2,
      paceSlowBurn: 0.66,
      complexity: 0.45,
      emotionalWeight: 0.8,
    };
  }
  if (preset === "dark_stylish") {
    return {
      moodCalm: 0.25,
      moodDark: 0.82,
      moodEmotional: 0.56,
      toneStylish: 0.9,
      toneFunny: 0.08,
      paceSlowBurn: 0.72,
      complexity: 0.7,
      emotionalWeight: 0.68,
    };
  }
  if (preset === "fun_light") {
    return {
      moodCalm: 0.62,
      moodDark: 0.08,
      moodEmotional: 0.44,
      toneStylish: 0.58,
      toneFunny: 0.88,
      paceSlowBurn: 0.2,
      complexity: 0.28,
      emotionalWeight: 0.32,
    };
  }
  if (preset === "tense_complex") {
    return {
      moodCalm: 0.18,
      moodDark: 0.76,
      moodEmotional: 0.5,
      toneStylish: 0.6,
      toneFunny: 0.06,
      paceSlowBurn: 0.7,
      complexity: 0.82,
      emotionalWeight: 0.66,
    };
  }
  return {
    moodCalm: 0.5,
    moodDark: 0.35,
    moodEmotional: 0.56,
    toneStylish: 0.62,
    toneFunny: 0.4,
    paceSlowBurn: 0.48,
    complexity: 0.46,
    emotionalWeight: 0.52,
  };
}

const movieSeeds: MovieSeed[] = [
  { title: "In the Mood for Love", releaseYear: 2000, runtimeMinutes: 98, genrePrimary: "romance", genreSecondary: "drama", preset: "calm_emotional", moodTags: ["calm", "emotional", "stylish", "melancholic"], watchContexts: ["solo_watch", "date_friendly", "late_night_fit"], contentWarnings: [] },
  { title: "Before Sunrise", releaseYear: 1995, runtimeMinutes: 101, genrePrimary: "romance", genreSecondary: "drama", preset: "calm_emotional", moodTags: ["calm", "emotional", "easy_to_watch"], watchContexts: ["date_friendly", "solo_watch"], contentWarnings: [] },
  { title: "Her", releaseYear: 2013, runtimeMinutes: 126, genrePrimary: "romance", genreSecondary: "sci-fi", preset: "calm_emotional", moodTags: ["calm", "emotional", "melancholic"], watchContexts: ["solo_watch", "date_friendly", "late_night_fit"], contentWarnings: ["sad_ending"] },
  { title: "Past Lives", releaseYear: 2023, runtimeMinutes: 106, genrePrimary: "drama", genreSecondary: "romance", preset: "calm_emotional", moodTags: ["calm", "emotional", "melancholic"], watchContexts: ["solo_watch", "date_friendly"], contentWarnings: ["sad_ending"] },
  { title: "Lost in Translation", releaseYear: 2003, runtimeMinutes: 102, genrePrimary: "drama", genreSecondary: "romance", preset: "calm_emotional", moodTags: ["calm", "stylish", "melancholic"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: [] },
  { title: "Call Me by Your Name", releaseYear: 2017, runtimeMinutes: 132, genrePrimary: "romance", genreSecondary: "drama", preset: "calm_emotional", moodTags: ["emotional", "stylish", "slow_burn"], watchContexts: ["date_friendly", "solo_watch"], contentWarnings: ["sad_ending"] },
  { title: "Brooklyn", releaseYear: 2015, runtimeMinutes: 111, genrePrimary: "romance", genreSecondary: "drama", preset: "calm_emotional", moodTags: ["emotional", "uplifting", "easy_to_watch"], watchContexts: ["date_friendly", "family_time"], contentWarnings: [] },
  { title: "The Before Trilogy: Sunset", releaseYear: 2004, runtimeMinutes: 80, genrePrimary: "romance", genreSecondary: "drama", preset: "calm_emotional", moodTags: ["calm", "emotional"], watchContexts: ["date_friendly", "solo_watch"], contentWarnings: [] },
  { title: "La La Land", releaseYear: 2016, runtimeMinutes: 128, genrePrimary: "musical", genreSecondary: "romance", preset: "balanced", moodTags: ["uplifting", "stylish", "emotional"], watchContexts: ["date_friendly", "friends_hangout"], contentWarnings: ["sad_ending"] },
  { title: "Sing Street", releaseYear: 2016, runtimeMinutes: 106, genrePrimary: "musical", genreSecondary: "drama", preset: "fun_light", moodTags: ["uplifting", "funny", "easy_to_watch"], watchContexts: ["friends_hangout", "date_friendly"], contentWarnings: [] },
  { title: "Begin Again", releaseYear: 2013, runtimeMinutes: 104, genrePrimary: "drama", genreSecondary: "music", preset: "balanced", moodTags: ["uplifting", "emotional"], watchContexts: ["friends_hangout", "date_friendly"], contentWarnings: [] },
  { title: "The Grand Budapest Hotel", releaseYear: 2014, runtimeMinutes: 99, genrePrimary: "comedy", genreSecondary: "adventure", preset: "fun_light", moodTags: ["funny", "stylish", "easy_to_watch"], watchContexts: ["friends_hangout", "date_friendly"], contentWarnings: [] },
  { title: "Paddington 2", releaseYear: 2017, runtimeMinutes: 103, genrePrimary: "family", genreSecondary: "comedy", preset: "fun_light", moodTags: ["uplifting", "funny", "easy_to_watch"], watchContexts: ["family_time", "friends_hangout"], contentWarnings: [] },
  { title: "Spider-Man: Into the Spider-Verse", releaseYear: 2018, runtimeMinutes: 117, genrePrimary: "animation", genreSecondary: "action", preset: "balanced", moodTags: ["uplifting", "stylish", "easy_to_watch"], watchContexts: ["friends_hangout", "family_time", "date_friendly"], contentWarnings: ["violence"] },
  { title: "The Nice Guys", releaseYear: 2016, runtimeMinutes: 116, genrePrimary: "comedy", genreSecondary: "crime", preset: "fun_light", moodTags: ["funny", "stylish", "easy_to_watch"], watchContexts: ["friends_hangout"], contentWarnings: ["violence"] },
  { title: "Palm Springs", releaseYear: 2020, runtimeMinutes: 90, genrePrimary: "romance", genreSecondary: "comedy", preset: "fun_light", moodTags: ["funny", "uplifting"], watchContexts: ["date_friendly", "friends_hangout"], contentWarnings: [] },
  { title: "Knives Out", releaseYear: 2019, runtimeMinutes: 130, genrePrimary: "mystery", genreSecondary: "comedy", preset: "balanced", moodTags: ["funny", "complex_plot", "easy_to_watch"], watchContexts: ["friends_hangout", "family_time"], contentWarnings: ["violence"] },
  { title: "Ocean's Eleven", releaseYear: 2001, runtimeMinutes: 116, genrePrimary: "crime", genreSecondary: "comedy", preset: "fun_light", moodTags: ["stylish", "easy_to_watch"], watchContexts: ["friends_hangout", "date_friendly"], contentWarnings: [] },
  { title: "Crazy Rich Asians", releaseYear: 2018, runtimeMinutes: 120, genrePrimary: "romance", genreSecondary: "comedy", preset: "fun_light", moodTags: ["uplifting", "stylish", "easy_to_watch"], watchContexts: ["date_friendly", "friends_hangout"], contentWarnings: [] },
  { title: "Chef", releaseYear: 2014, runtimeMinutes: 114, genrePrimary: "comedy", genreSecondary: "drama", preset: "fun_light", moodTags: ["uplifting", "easy_to_watch"], watchContexts: ["family_time", "friends_hangout"], contentWarnings: [] },
  { title: "Blade Runner 2049", releaseYear: 2017, runtimeMinutes: 164, genrePrimary: "sci-fi", genreSecondary: "drama", preset: "dark_stylish", moodTags: ["dark", "stylish", "slow_burn"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: ["violence"] },
  { title: "Drive", releaseYear: 2011, runtimeMinutes: 100, genrePrimary: "crime", genreSecondary: "drama", preset: "dark_stylish", moodTags: ["dark", "stylish"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: ["violence"] },
  { title: "Nightcrawler", releaseYear: 2014, runtimeMinutes: 117, genrePrimary: "thriller", genreSecondary: "crime", preset: "dark_stylish", moodTags: ["dark", "tense", "stylish"], watchContexts: ["solo_watch"], contentWarnings: ["disturbing", "violence"] },
  { title: "The Batman", releaseYear: 2022, runtimeMinutes: 176, genrePrimary: "action", genreSecondary: "crime", preset: "dark_stylish", moodTags: ["dark", "stylish", "complex_plot"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: ["violence"] },
  { title: "The Social Network", releaseYear: 2010, runtimeMinutes: 120, genrePrimary: "drama", genreSecondary: "biography", preset: "dark_stylish", moodTags: ["stylish", "tense", "complex_plot"], watchContexts: ["solo_watch", "friends_hangout"], contentWarnings: [] },
  { title: "Only God Forgives", releaseYear: 2013, runtimeMinutes: 90, genrePrimary: "thriller", genreSecondary: "crime", preset: "dark_stylish", moodTags: ["dark", "stylish"], watchContexts: ["solo_watch"], contentWarnings: ["violence", "disturbing"] },
  { title: "The Neon Demon", releaseYear: 2016, runtimeMinutes: 117, genrePrimary: "horror", genreSecondary: "thriller", preset: "dark_stylish", moodTags: ["dark", "stylish"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: ["disturbing"] },
  { title: "Nocturnal Animals", releaseYear: 2016, runtimeMinutes: 116, genrePrimary: "thriller", genreSecondary: "drama", preset: "dark_stylish", moodTags: ["dark", "stylish", "tense"], watchContexts: ["solo_watch"], contentWarnings: ["disturbing", "violence"] },
  { title: "Prisoners", releaseYear: 2013, runtimeMinutes: 153, genrePrimary: "thriller", genreSecondary: "crime", preset: "tense_complex", moodTags: ["dark", "tense", "complex_plot"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: ["disturbing", "violence"] },
  { title: "Zodiac", releaseYear: 2007, runtimeMinutes: 157, genrePrimary: "thriller", genreSecondary: "crime", preset: "tense_complex", moodTags: ["dark", "tense", "complex_plot", "slow_burn"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: ["disturbing", "violence"] },
  { title: "Se7en", releaseYear: 1995, runtimeMinutes: 127, genrePrimary: "thriller", genreSecondary: "crime", preset: "tense_complex", moodTags: ["dark", "tense"], watchContexts: ["solo_watch"], contentWarnings: ["disturbing", "violence"] },
  { title: "Memories of Murder", releaseYear: 2003, runtimeMinutes: 132, genrePrimary: "thriller", genreSecondary: "crime", preset: "tense_complex", moodTags: ["dark", "complex_plot"], watchContexts: ["solo_watch"], contentWarnings: ["violence"] },
  { title: "The Girl with the Dragon Tattoo", releaseYear: 2011, runtimeMinutes: 158, genrePrimary: "thriller", genreSecondary: "mystery", preset: "tense_complex", moodTags: ["dark", "tense", "complex_plot"], watchContexts: ["solo_watch"], contentWarnings: ["disturbing", "violence"] },
  { title: "The Prestige", releaseYear: 2006, runtimeMinutes: 130, genrePrimary: "mystery", genreSecondary: "drama", preset: "tense_complex", moodTags: ["complex_plot", "dark"], watchContexts: ["solo_watch", "friends_hangout"], contentWarnings: [] },
  { title: "Arrival", releaseYear: 2016, runtimeMinutes: 116, genrePrimary: "sci-fi", genreSecondary: "drama", preset: "balanced", moodTags: ["emotional", "complex_plot", "slow_burn"], watchContexts: ["solo_watch", "date_friendly"], contentWarnings: [] },
  { title: "Ex Machina", releaseYear: 2014, runtimeMinutes: 108, genrePrimary: "sci-fi", genreSecondary: "thriller", preset: "tense_complex", moodTags: ["dark", "stylish", "complex_plot"], watchContexts: ["solo_watch"], contentWarnings: ["disturbing"] },
  { title: "The Martian", releaseYear: 2015, runtimeMinutes: 144, genrePrimary: "sci-fi", genreSecondary: "adventure", preset: "balanced", moodTags: ["uplifting", "easy_to_watch"], watchContexts: ["friends_hangout", "family_time"], contentWarnings: [] },
  { title: "Interstellar", releaseYear: 2014, runtimeMinutes: 169, genrePrimary: "sci-fi", genreSecondary: "drama", preset: "balanced", moodTags: ["emotional", "complex_plot"], watchContexts: ["solo_watch", "friends_hangout"], contentWarnings: [] },
  { title: "Whiplash", releaseYear: 2014, runtimeMinutes: 106, genrePrimary: "drama", genreSecondary: "music", preset: "tense_complex", moodTags: ["tense", "emotional"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: ["disturbing"] },
  { title: "Birdman", releaseYear: 2014, runtimeMinutes: 119, genrePrimary: "drama", genreSecondary: "comedy", preset: "balanced", moodTags: ["stylish", "complex_plot"], watchContexts: ["solo_watch", "friends_hangout"], contentWarnings: [] },
  { title: "Little Miss Sunshine", releaseYear: 2006, runtimeMinutes: 101, genrePrimary: "comedy", genreSecondary: "drama", preset: "fun_light", moodTags: ["uplifting", "easy_to_watch"], watchContexts: ["family_time", "friends_hangout"], contentWarnings: [] },
  { title: "About Time", releaseYear: 2013, runtimeMinutes: 123, genrePrimary: "romance", genreSecondary: "drama", preset: "calm_emotional", moodTags: ["emotional", "uplifting", "easy_to_watch"], watchContexts: ["date_friendly", "family_time"], contentWarnings: ["sad_ending"] },
  { title: "Amelie", releaseYear: 2001, runtimeMinutes: 122, genrePrimary: "romance", genreSecondary: "comedy", preset: "fun_light", moodTags: ["stylish", "uplifting"], watchContexts: ["date_friendly", "solo_watch"], contentWarnings: [] },
  { title: "Frances Ha", releaseYear: 2012, runtimeMinutes: 86, genrePrimary: "drama", genreSecondary: "comedy", preset: "balanced", moodTags: ["stylish", "easy_to_watch"], watchContexts: ["solo_watch", "friends_hangout"], contentWarnings: [] },
  { title: "Paterson", releaseYear: 2016, runtimeMinutes: 118, genrePrimary: "drama", preset: "calm_emotional", moodTags: ["calm", "slow_burn"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: [] },
  { title: "Columbus", releaseYear: 2017, runtimeMinutes: 104, genrePrimary: "drama", preset: "calm_emotional", moodTags: ["calm", "stylish", "slow_burn"], watchContexts: ["solo_watch"], contentWarnings: [] },
  { title: "Moonlight", releaseYear: 2016, runtimeMinutes: 111, genrePrimary: "drama", preset: "calm_emotional", moodTags: ["emotional", "stylish"], watchContexts: ["solo_watch", "date_friendly"], contentWarnings: ["sad_ending"] },
  { title: "Lady Bird", releaseYear: 2017, runtimeMinutes: 94, genrePrimary: "drama", genreSecondary: "comedy", preset: "balanced", moodTags: ["funny", "emotional", "easy_to_watch"], watchContexts: ["friends_hangout", "family_time"], contentWarnings: [] },
  { title: "The Farewell", releaseYear: 2019, runtimeMinutes: 100, genrePrimary: "drama", genreSecondary: "comedy", preset: "calm_emotional", moodTags: ["emotional", "easy_to_watch"], watchContexts: ["family_time", "solo_watch"], contentWarnings: [] },
  { title: "Jojo Rabbit", releaseYear: 2019, runtimeMinutes: 108, genrePrimary: "comedy", genreSecondary: "drama", preset: "balanced", moodTags: ["funny", "emotional"], watchContexts: ["friends_hangout", "solo_watch"], contentWarnings: ["violence"] },
  { title: "Baby Driver", releaseYear: 2017, runtimeMinutes: 113, genrePrimary: "action", genreSecondary: "crime", preset: "dark_stylish", moodTags: ["stylish", "easy_to_watch"], watchContexts: ["friends_hangout", "late_night_fit"], contentWarnings: ["violence"] },
  { title: "Heat", releaseYear: 1995, runtimeMinutes: 170, genrePrimary: "crime", genreSecondary: "thriller", preset: "tense_complex", moodTags: ["dark", "stylish", "complex_plot"], watchContexts: ["solo_watch", "friends_hangout"], contentWarnings: ["violence"] },
  { title: "Edge of Tomorrow", releaseYear: 2014, runtimeMinutes: 113, genrePrimary: "sci-fi", genreSecondary: "action", preset: "balanced", moodTags: ["tense", "easy_to_watch"], watchContexts: ["friends_hangout", "solo_watch"], contentWarnings: ["violence"] },
  { title: "School of Rock", releaseYear: 2003, runtimeMinutes: 109, genrePrimary: "comedy", genreSecondary: "music", preset: "fun_light", moodTags: ["funny", "uplifting", "easy_to_watch"], watchContexts: ["family_time", "friends_hangout"], contentWarnings: [] },
  { title: "The Secret Life of Walter Mitty", releaseYear: 2013, runtimeMinutes: 114, genrePrimary: "adventure", genreSecondary: "drama", preset: "balanced", moodTags: ["uplifting", "easy_to_watch"], watchContexts: ["solo_watch", "family_time"], contentWarnings: [] },
];

function validateSeed(seed: MovieSeed) {
  for (const tag of seed.moodTags) {
    if (!moodSet.has(tag as MoodTag) && !styleSet.has(tag as StyleTag)) {
      throw new Error(`Invalid mood/style tag in seed: ${seed.title} -> ${tag}`);
    }
  }
  for (const warning of seed.contentWarnings) {
    if (!warningSet.has(warning)) {
      throw new Error(`Invalid content warning in seed: ${seed.title} -> ${warning}`);
    }
  }
  for (const context of seed.watchContexts) {
    if (!contextSet.has(context)) {
      throw new Error(`Invalid watch context in seed: ${seed.title} -> ${context}`);
    }
  }
}

function asCreateInput(seed: MovieSeed): Prisma.MovieCreateInput {
  validateSeed(seed);
  return {
    title: seed.title,
    releaseYear: seed.releaseYear,
    runtimeMinutes: seed.runtimeMinutes,
    genrePrimary: seed.genrePrimary,
    genreSecondary: seed.genreSecondary,
    ...vectorFromPreset(seed.preset),
    moodTags: seed.moodTags,
    watchContexts: seed.watchContexts,
    contentWarnings: seed.contentWarnings,
  };
}

async function main() {
  for (const seed of movieSeeds) {
    await prisma.movie.upsert({
      where: {
        title_releaseYear: {
          title: seed.title,
          releaseYear: seed.releaseYear,
        },
      },
      update: asCreateInput(seed),
      create: asCreateInput(seed),
    });
  }

  console.log(`Seeded ${movieSeeds.length} movies.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
