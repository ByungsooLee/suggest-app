import { PrismaClient, type Prisma } from "@prisma/client";
import { resolveStrictMoviePoster } from "../src/lib/movies/strict-movie-poster-match";
import { ONBOARDING_MOVIES_V1 } from "../src/lib/onboarding/onboarding-movie-list";

import {
  CONTENT_WARNING_TAGS,
  MOOD_TAGS,
  REVIEW_SOURCES,
  STYLE_TAGS,
  WATCH_CONTEXTS,
  type ContentWarningTag,
  type MoodTag,
  type ReviewSource,
  type StyleTag,
  type StreamingProvider,
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
  overview?: string;
  directors?: string[];
  cast?: string[];
  reviewScore?: number;
  reviewSummary?: string;
  reviewSource?: ReviewSource;
  providers?: StreamingProvider[];
};

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
  Parasite: { directors: ["Bong Joon-ho"], cast: ["Song Kang-ho", "Choi Woo-shik"] },
  "Inside Out": { directors: ["Pete Docter"], cast: ["Amy Poehler", "Phyllis Smith"] },
  "Gone Girl": { directors: ["David Fincher"], cast: ["Ben Affleck", "Rosamund Pike"] },
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

const moodSet = new Set(MOOD_TAGS);
const styleSet = new Set(STYLE_TAGS);
const warningSet = new Set(CONTENT_WARNING_TAGS);
const contextSet = new Set(WATCH_CONTEXTS);
const reviewSourceSet = new Set(REVIEW_SOURCES);

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function normalizeReviewSource(source?: ReviewSource): ReviewSource {
  if (!source) return "internal_editorial";
  return reviewSourceSet.has(source) ? source : "internal_editorial";
}

function defaultProviders(seed: MovieSeed): StreamingProvider[] {
  if (seed.providers?.length) return [...new Set(seed.providers)];
  if (seed.genrePrimary === "family" || seed.genrePrimary === "animation") {
    return ["disney_plus", "amazon_prime"];
  }
  if (seed.genrePrimary === "horror" || seed.genrePrimary === "thriller") {
    return ["amazon_prime", "netflix"];
  }
  return ["netflix", "amazon_prime"];
}

function defaultOverview(seed: MovieSeed) {
  return `${seed.genrePrimary}テイストで${seed.watchContexts[0] ?? "solo_watch"}に向く一本。今夜の気分に合わせて選びやすい作品です。`;
}

function vectorFromPreset(preset: VectorPreset) {
  if (preset === "calm_emotional") {
    return {
      moodCalm: 0.78,
      moodDark: 0.2,
      moodEmotional: 0.84,
      moodUplifting: 0.52,
      toneStylish: 0.7,
      toneFunny: 0.2,
      paceFast: 0.32,
      paceSlowBurn: 0.66,
      complexity: 0.45,
      emotionalWeight: 0.8,
      tension: 0.28,
      accessibility: 0.72,
    };
  }
  if (preset === "dark_stylish") {
    return {
      moodCalm: 0.25,
      moodDark: 0.82,
      moodEmotional: 0.56,
      moodUplifting: 0.2,
      toneStylish: 0.9,
      toneFunny: 0.08,
      paceFast: 0.34,
      paceSlowBurn: 0.72,
      complexity: 0.7,
      emotionalWeight: 0.68,
      tension: 0.74,
      accessibility: 0.34,
    };
  }
  if (preset === "fun_light") {
    return {
      moodCalm: 0.62,
      moodDark: 0.08,
      moodEmotional: 0.44,
      moodUplifting: 0.82,
      toneStylish: 0.58,
      toneFunny: 0.88,
      paceFast: 0.66,
      paceSlowBurn: 0.2,
      complexity: 0.28,
      emotionalWeight: 0.32,
      tension: 0.24,
      accessibility: 0.92,
    };
  }
  if (preset === "tense_complex") {
    return {
      moodCalm: 0.18,
      moodDark: 0.76,
      moodEmotional: 0.5,
      moodUplifting: 0.18,
      toneStylish: 0.6,
      toneFunny: 0.06,
      paceFast: 0.48,
      paceSlowBurn: 0.7,
      complexity: 0.82,
      emotionalWeight: 0.66,
      tension: 0.86,
      accessibility: 0.38,
    };
  }
  return {
    moodCalm: 0.5,
    moodDark: 0.35,
    moodEmotional: 0.56,
    moodUplifting: 0.58,
    toneStylish: 0.62,
    toneFunny: 0.4,
    paceFast: 0.52,
    paceSlowBurn: 0.48,
    complexity: 0.46,
    emotionalWeight: 0.52,
    tension: 0.5,
    accessibility: 0.64,
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
  { title: "Parasite", releaseYear: 2019, runtimeMinutes: 132, genrePrimary: "thriller", genreSecondary: "drama", preset: "tense_complex", moodTags: ["dark", "complex_plot"], watchContexts: ["solo_watch", "friends_hangout"], contentWarnings: ["violence", "disturbing"] },
  { title: "Inside Out", releaseYear: 2015, runtimeMinutes: 95, genrePrimary: "animation", genreSecondary: "family", preset: "fun_light", moodTags: ["uplifting", "emotional", "easy_to_watch"], watchContexts: ["family_time", "friends_hangout"], contentWarnings: [] },
  { title: "Gone Girl", releaseYear: 2014, runtimeMinutes: 149, genrePrimary: "thriller", genreSecondary: "mystery", preset: "dark_stylish", moodTags: ["dark", "tense", "complex_plot"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: ["violence", "disturbing"] },
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
  const slug = slugify(seed.title);
  const providers = defaultProviders(seed);
  const people = realPersonMetadata[seed.title];
  const onboardingOverride = ONBOARDING_MOVIES_V1.find(
    (movie) => movie.title === seed.title && movie.releaseYear === seed.releaseYear,
  );
  const featureVector = onboardingOverride?.features ?? vectorFromPreset(seed.preset);

  return {
    title: seed.title,
    releaseYear: seed.releaseYear,
    runtimeMinutes: seed.runtimeMinutes,
    genrePrimary: seed.genrePrimary,
    genreSecondary: seed.genreSecondary,
    posterUrl: null,
    backdropUrl: null,
    overview: seed.overview ?? defaultOverview(seed),
    directors: seed.directors ?? people?.directors ?? ["Unknown Director"],
    cast: seed.cast ?? people?.cast ?? ["Unknown Cast A", "Unknown Cast B"],
    reviewScore: seed.reviewScore ?? 7.2,
    reviewSummary: seed.reviewSummary ?? "全体として安定した評価を獲得している作品です。",
    reviewSource: normalizeReviewSource(seed.reviewSource),
    ...featureVector,
    moodTags: seed.moodTags,
    watchContexts: seed.watchContexts,
    contentWarnings: seed.contentWarnings,
    availabilities: {
      create: providers.map((provider) => ({
        provider,
        region: "KR",
        url: `https://example.com/watch/${provider}/${slug}`,
        lastSyncedAt: new Date(),
      })),
    },
  };
}

async function main() {
  for (const seed of movieSeeds) {
    const posterMatch = await resolveStrictMoviePoster({
      title: seed.title,
      releaseYear: seed.releaseYear,
    });
    const createInput = asCreateInput(seed);
    const movie = await prisma.movie.upsert({
      where: {
        title_releaseYear: {
          title: seed.title,
          releaseYear: seed.releaseYear,
        },
      },
      update: {
        ...createInput,
        posterUrl: posterMatch.posterUrl,
        backdropUrl: null,
        availabilities: undefined,
      },
      create: {
        ...createInput,
        posterUrl: posterMatch.posterUrl,
        backdropUrl: null,
      },
    });

    await prisma.movieAvailability.deleteMany({ where: { movieId: movie.id } });
    await prisma.movieAvailability.createMany({
      data: defaultProviders(seed).map((provider) => ({
        movieId: movie.id,
        provider,
        region: "KR",
        url: `https://example.com/watch/${provider}/${slugify(seed.title)}`,
        lastSyncedAt: new Date(),
      })),
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
