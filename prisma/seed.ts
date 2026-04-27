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

  // Anime / Animation
  "Spirited Away": { directors: ["Hayao Miyazaki"], cast: ["Daveigh Chase", "Suzanne Pleshette"] },
  "Princess Mononoke": { directors: ["Hayao Miyazaki"], cast: ["Gillian Anderson", "Billy Crudup"] },
  "My Neighbor Totoro": { directors: ["Hayao Miyazaki"], cast: ["Dakota Fanning", "Elle Fanning"] },
  "Howl's Moving Castle": { directors: ["Hayao Miyazaki"], cast: ["Christian Bale", "Emily Mortimer"] },
  "The Wind Rises": { directors: ["Hayao Miyazaki"], cast: ["Joseph Gordon-Levitt", "Emily Blunt"] },
  "Grave of the Fireflies": { directors: ["Isao Takahata"], cast: ["Tsutomu Tatsumi", "Ayano Shiraishi"] },
  "The Tale of the Princess Kaguya": { directors: ["Isao Takahata"], cast: ["Chloe Grace Moretz", "James Caan"] },
  "Your Name": { directors: ["Makoto Shinkai"], cast: ["Ryunosuke Kamiki", "Mone Kamishiraishi"] },
  "Weathering with You": { directors: ["Makoto Shinkai"], cast: ["Kotaro Daigo", "Nana Mori"] },
  "A Silent Voice": { directors: ["Naoko Yamada"], cast: ["Miyu Irino", "Saori Hayami"] },
  "Perfect Blue": { directors: ["Satoshi Kon"], cast: ["Junko Iwao", "Rica Matsumoto"] },
  "Millennium Actress": { directors: ["Satoshi Kon"], cast: ["Miyoko Shoji", "Shozo Iizuka"] },
  "Paprika": { directors: ["Satoshi Kon"], cast: ["Megumi Hayashibara", "Toru Furuya"] },
  "Ghost in the Shell": { directors: ["Mamoru Oshii"], cast: ["Atsuko Tanaka", "Akio Otsuka"] },
  "Akira": { directors: ["Katsuhiro Otomo"], cast: ["Mitsuo Iwata", "Nozomu Sasaki"] },
  "Wolf Children": { directors: ["Mamoru Hosoda"], cast: ["Aoi Miyazaki", "Takao Osawa"] },
  "The Boy and the Heron": { directors: ["Hayao Miyazaki"], cast: ["Soma Santoki", "Masaki Suda"] },
  "Belle": { directors: ["Mamoru Hosoda"], cast: ["Kaho Nakamura", "Ryo Narita"] },
  "Nausicaa of the Valley of the Wind": { directors: ["Hayao Miyazaki"], cast: ["Sumi Shimamoto", "Goro Naya"] },
  "Castle in the Sky": { directors: ["Hayao Miyazaki"], cast: ["Anna Paquin", "James Van Der Beek"] },

  // Korean Films
  "Oldboy": { directors: ["Park Chan-wook"], cast: ["Choi Min-sik", "Yoo Ji-tae"] },
  "The Handmaiden": { directors: ["Park Chan-wook"], cast: ["Kim Min-hee", "Ha Jung-woo"] },
  "Burning": { directors: ["Lee Chang-dong"], cast: ["Yoo Ah-in", "Steven Yeun", "Jeon Jong-seo"] },
  "A Bittersweet Life": { directors: ["Kim Jee-woon"], cast: ["Lee Byung-hun", "Kim Young-cheol"] },
  "I Saw the Devil": { directors: ["Kim Jee-woon"], cast: ["Lee Byung-hun", "Choi Min-sik"] },
  "Train to Busan": { directors: ["Yeon Sang-ho"], cast: ["Gong Yoo", "Ma Dong-seok"] },
  "The Wailing": { directors: ["Na Hong-jin"], cast: ["Kwak Do-won", "Hwang Jung-min"] },
  "A Tale of Two Sisters": { directors: ["Kim Jee-woon"], cast: ["Im Soo-jung", "Moon Geun-young"] },
  "Spring Summer Fall Winter and Spring": { directors: ["Kim Ki-duk"], cast: ["Oh Young-soo", "Kim Ki-duk"] },
  "The Man from Nowhere": { directors: ["Lee Jeong-beom"], cast: ["Won Bin", "Kim Sae-ron"] },

  // Japanese Live-Action
  "Drive My Car": { directors: ["Ryusuke Hamaguchi"], cast: ["Hidetoshi Nishijima", "Toko Miura"] },
  "Wheel of Fortune and Fantasy": { directors: ["Ryusuke Hamaguchi"], cast: ["Kotone Furukawa", "Ayumu Nakajima"] },
  "Shoplifters": { directors: ["Hirokazu Koreeda"], cast: ["Lily Franky", "Sakura Ando"] },
  "Still Walking": { directors: ["Hirokazu Koreeda"], cast: ["Hiroshi Abe", "Yui Natsukawa"] },
  "Departures": { directors: ["Yojiro Takita"], cast: ["Masahiro Motoki", "Ryoko Hirosue"] },
  "After Life": { directors: ["Hirokazu Koreeda"], cast: ["Arata Iura", "Erika Oda"] },
  "Portrait of a Lady on Fire": { directors: ["Celine Sciamma"], cast: ["Noemie Merlant", "Adele Haenel"] },
  "Our Little Sister": { directors: ["Hirokazu Koreeda"], cast: ["Haruka Ayase", "Masami Nagasawa"] },

  // Classic / World Cinema
  "2001: A Space Odyssey": { directors: ["Stanley Kubrick"], cast: ["Keir Dullea", "Gary Lockwood"] },
  "Apocalypse Now": { directors: ["Francis Ford Coppola"], cast: ["Martin Sheen", "Marlon Brando"] },
  "Goodfellas": { directors: ["Martin Scorsese"], cast: ["Ray Liotta", "Robert De Niro", "Joe Pesci"] },
  "Taxi Driver": { directors: ["Martin Scorsese"], cast: ["Robert De Niro", "Jodie Foster"] },
  "The Godfather": { directors: ["Francis Ford Coppola"], cast: ["Marlon Brando", "Al Pacino"] },
  "Rashomon": { directors: ["Akira Kurosawa"], cast: ["Toshiro Mifune", "Machiko Kyo"] },
  "Tokyo Story": { directors: ["Yasujiro Ozu"], cast: ["Chishu Ryu", "Chieko Higashiyama"] },
  "8½": { directors: ["Federico Fellini"], cast: ["Marcello Mastroianni", "Claudia Cardinale"] },
  "Mulholland Drive": { directors: ["David Lynch"], cast: ["Naomi Watts", "Laura Harring"] },
  "The Shining": { directors: ["Stanley Kubrick"], cast: ["Jack Nicholson", "Shelley Duvall"] },

  // Drama
  "Marriage Story": { directors: ["Noah Baumbach"], cast: ["Adam Driver", "Scarlett Johansson"] },
  "Manchester by the Sea": { directors: ["Kenneth Lonergan"], cast: ["Casey Affleck", "Michelle Williams"] },
  "Room": { directors: ["Lenny Abrahamson"], cast: ["Brie Larson", "Jacob Tremblay"] },
  "Spotlight": { directors: ["Tom McCarthy"], cast: ["Mark Ruffalo", "Michael Keaton"] },
  "The Shawshank Redemption": { directors: ["Frank Darabont"], cast: ["Tim Robbins", "Morgan Freeman"] },
  "Good Will Hunting": { directors: ["Gus Van Sant"], cast: ["Matt Damon", "Robin Williams"] },
  "Eternal Sunshine of the Spotless Mind": { directors: ["Michel Gondry"], cast: ["Jim Carrey", "Kate Winslet"] },
  "Carol": { directors: ["Todd Haynes"], cast: ["Cate Blanchett", "Rooney Mara"] },
  "Blue Valentine": { directors: ["Derek Cianfrance"], cast: ["Ryan Gosling", "Michelle Williams"] },
  "The Killing of a Sacred Deer": { directors: ["Yorgos Lanthimos"], cast: ["Colin Farrell", "Nicole Kidman"] },
  "Wild": { directors: ["Jean-Marc Vallee"], cast: ["Reese Witherspoon", "Laura Dern"] },
  "Hereditary": { directors: ["Ari Aster"], cast: ["Toni Collette", "Alex Wolff"] },

  // Action / Blockbuster
  "The Dark Knight": { directors: ["Christopher Nolan"], cast: ["Christian Bale", "Heath Ledger"] },
  "Mad Max: Fury Road": { directors: ["George Miller"], cast: ["Tom Hardy", "Charlize Theron"] },
  "John Wick": { directors: ["Chad Stahelski"], cast: ["Keanu Reeves", "Ian McShane"] },
  "Top Gun: Maverick": { directors: ["Joseph Kosinski"], cast: ["Tom Cruise", "Miles Teller"] },
  "Everything Everywhere All at Once": { directors: ["Daniel Kwan", "Daniel Scheinert"], cast: ["Michelle Yeoh", "Ke Huy Quan"] },
  "Mission: Impossible - Fallout": { directors: ["Christopher McQuarrie"], cast: ["Tom Cruise", "Henry Cavill"] },
  "Dune": { directors: ["Denis Villeneuve"], cast: ["Timothee Chalamet", "Zendaya"] },
  "1917": { directors: ["Sam Mendes"], cast: ["George MacKay", "Dean-Charles Chapman"] },

  // Sci-Fi / Spec Fiction
  "Annihilation": { directors: ["Alex Garland"], cast: ["Natalie Portman", "Jennifer Jason Leigh"] },
  "Moon": { directors: ["Duncan Jones"], cast: ["Sam Rockwell", "Kevin Spacey"] },
  "Children of Men": { directors: ["Alfonso Cuaron"], cast: ["Clive Owen", "Julianne Moore"] },

  // Horror
  "Get Out": { directors: ["Jordan Peele"], cast: ["Daniel Kaluuya", "Allison Williams"] },
  "Midsommar": { directors: ["Ari Aster"], cast: ["Florence Pugh", "Jack Reynor"] },
  "The Witch": { directors: ["Robert Eggers"], cast: ["Anya Taylor-Joy", "Ralph Ineson"] },
  "A Quiet Place": { directors: ["John Krasinski"], cast: ["Emily Blunt", "John Krasinski"] },
  "Suspiria": { directors: ["Luca Guadagnino"], cast: ["Dakota Johnson", "Tilda Swinton"] },

  // Comedy / Feel-good
  "Superbad": { directors: ["Greg Mottola"], cast: ["Michael Cera", "Jonah Hill"] },
  "The Intouchables": { directors: ["Olivier Nakache", "Eric Toledano"], cast: ["Francois Cluzet", "Omar Sy"] },
  "Hunt for the Wilderpeople": { directors: ["Taika Waititi"], cast: ["Sam Neill", "Julian Dennison"] },
  "What We Do in the Shadows": { directors: ["Taika Waititi", "Jemaine Clement"], cast: ["Taika Waititi", "Jemaine Clement"] },
  "The Big Lebowski": { directors: ["Joel Coen", "Ethan Coen"], cast: ["Jeff Bridges", "John Goodman"] },
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

  // Anime / Ghibli / Japanese Animation
  { title: "Spirited Away", releaseYear: 2001, runtimeMinutes: 125, genrePrimary: "animation", genreSecondary: "fantasy", preset: "calm_emotional", moodTags: ["emotional", "stylish", "visual_masterpiece"], watchContexts: ["family_time", "date_friendly", "solo_watch"], contentWarnings: [], reviewScore: 8.6 },
  { title: "Princess Mononoke", releaseYear: 1997, runtimeMinutes: 134, genrePrimary: "animation", genreSecondary: "fantasy", preset: "balanced", moodTags: ["dark", "emotional", "visual_masterpiece"], watchContexts: ["solo_watch", "friends_hangout"], contentWarnings: ["violence"], reviewScore: 8.4 },
  { title: "My Neighbor Totoro", releaseYear: 1988, runtimeMinutes: 86, genrePrimary: "animation", genreSecondary: "family", preset: "fun_light", moodTags: ["calm", "uplifting", "easy_to_watch"], watchContexts: ["family_time", "date_friendly"], contentWarnings: [], reviewScore: 8.1 },
  { title: "Howl's Moving Castle", releaseYear: 2004, runtimeMinutes: 119, genrePrimary: "animation", genreSecondary: "fantasy", preset: "calm_emotional", moodTags: ["emotional", "stylish", "visual_masterpiece"], watchContexts: ["date_friendly", "family_time", "solo_watch"], contentWarnings: [], reviewScore: 8.2 },
  { title: "The Wind Rises", releaseYear: 2013, runtimeMinutes: 126, genrePrimary: "animation", genreSecondary: "drama", preset: "calm_emotional", moodTags: ["calm", "emotional", "melancholic"], watchContexts: ["solo_watch", "date_friendly"], contentWarnings: ["sad_ending"], reviewScore: 7.8 },
  { title: "Grave of the Fireflies", releaseYear: 1988, runtimeMinutes: 89, genrePrimary: "animation", genreSecondary: "drama", preset: "calm_emotional", moodTags: ["dark", "emotional", "melancholic"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: ["sad_ending", "disturbing"], reviewScore: 8.5 },
  { title: "The Tale of the Princess Kaguya", releaseYear: 2013, runtimeMinutes: 137, genrePrimary: "animation", genreSecondary: "fantasy", preset: "calm_emotional", moodTags: ["calm", "emotional", "visual_masterpiece", "melancholic"], watchContexts: ["solo_watch", "date_friendly"], contentWarnings: ["sad_ending"], reviewScore: 8.1 },
  { title: "Your Name", releaseYear: 2016, runtimeMinutes: 106, genrePrimary: "animation", genreSecondary: "romance", preset: "calm_emotional", moodTags: ["emotional", "uplifting", "stylish"], watchContexts: ["date_friendly", "friends_hangout", "solo_watch"], contentWarnings: [], reviewScore: 8.4 },
  { title: "Weathering with You", releaseYear: 2019, runtimeMinutes: 112, genrePrimary: "animation", genreSecondary: "romance", preset: "balanced", moodTags: ["emotional", "stylish", "uplifting"], watchContexts: ["date_friendly", "solo_watch"], contentWarnings: [], reviewScore: 7.5 },
  { title: "A Silent Voice", releaseYear: 2016, runtimeMinutes: 130, genrePrimary: "animation", genreSecondary: "drama", preset: "calm_emotional", moodTags: ["emotional", "melancholic", "slow_burn"], watchContexts: ["solo_watch", "date_friendly"], contentWarnings: ["sad_ending", "disturbing"], reviewScore: 8.1 },
  { title: "Perfect Blue", releaseYear: 1997, runtimeMinutes: 81, genrePrimary: "animation", genreSecondary: "thriller", preset: "dark_stylish", moodTags: ["dark", "tense", "complex_plot"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: ["disturbing", "violence"], reviewScore: 8.0 },
  { title: "Millennium Actress", releaseYear: 2001, runtimeMinutes: 87, genrePrimary: "animation", genreSecondary: "drama", preset: "calm_emotional", moodTags: ["emotional", "stylish", "complex_plot"], watchContexts: ["solo_watch", "date_friendly"], contentWarnings: [], reviewScore: 7.9 },
  { title: "Paprika", releaseYear: 2006, runtimeMinutes: 90, genrePrimary: "animation", genreSecondary: "sci-fi", preset: "dark_stylish", moodTags: ["stylish", "complex_plot", "visual_masterpiece"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: ["disturbing"], reviewScore: 7.7 },
  { title: "Ghost in the Shell", releaseYear: 1995, runtimeMinutes: 83, genrePrimary: "animation", genreSecondary: "sci-fi", preset: "dark_stylish", moodTags: ["dark", "stylish", "complex_plot", "slow_burn"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: ["violence"], reviewScore: 8.0 },
  { title: "Akira", releaseYear: 1988, runtimeMinutes: 124, genrePrimary: "animation", genreSecondary: "sci-fi", preset: "tense_complex", moodTags: ["dark", "tense", "complex_plot", "visual_masterpiece"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: ["violence", "disturbing"], reviewScore: 8.0 },
  { title: "Wolf Children", releaseYear: 2012, runtimeMinutes: 117, genrePrimary: "animation", genreSecondary: "fantasy", preset: "calm_emotional", moodTags: ["emotional", "uplifting", "melancholic"], watchContexts: ["family_time", "date_friendly", "solo_watch"], contentWarnings: ["sad_ending"], reviewScore: 7.7 },
  { title: "The Boy and the Heron", releaseYear: 2023, runtimeMinutes: 124, genrePrimary: "animation", genreSecondary: "fantasy", preset: "balanced", moodTags: ["emotional", "stylish", "visual_masterpiece", "complex_plot"], watchContexts: ["solo_watch", "date_friendly"], contentWarnings: [], reviewScore: 7.6 },
  { title: "Belle", releaseYear: 2021, runtimeMinutes: 124, genrePrimary: "animation", genreSecondary: "musical", preset: "balanced", moodTags: ["emotional", "uplifting", "stylish"], watchContexts: ["date_friendly", "friends_hangout", "solo_watch"], contentWarnings: [], reviewScore: 7.3 },
  { title: "Nausicaa of the Valley of the Wind", releaseYear: 1984, runtimeMinutes: 117, genrePrimary: "animation", genreSecondary: "fantasy", preset: "balanced", moodTags: ["uplifting", "emotional", "visual_masterpiece"], watchContexts: ["family_time", "friends_hangout"], contentWarnings: ["violence"], reviewScore: 8.1 },
  { title: "Castle in the Sky", releaseYear: 1986, runtimeMinutes: 124, genrePrimary: "animation", genreSecondary: "adventure", preset: "fun_light", moodTags: ["uplifting", "easy_to_watch", "stylish"], watchContexts: ["family_time", "friends_hangout", "date_friendly"], contentWarnings: ["violence"], reviewScore: 8.0 },

  // Korean Films
  { title: "Oldboy", releaseYear: 2003, runtimeMinutes: 120, genrePrimary: "thriller", genreSecondary: "mystery", preset: "tense_complex", moodTags: ["dark", "tense", "complex_plot"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: ["violence", "disturbing"], reviewScore: 8.4 },
  { title: "The Handmaiden", releaseYear: 2016, runtimeMinutes: 145, genrePrimary: "thriller", genreSecondary: "drama", preset: "dark_stylish", moodTags: ["dark", "stylish", "complex_plot"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: ["disturbing", "violence"], reviewScore: 8.1 },
  { title: "Burning", releaseYear: 2018, runtimeMinutes: 148, genrePrimary: "drama", genreSecondary: "mystery", preset: "dark_stylish", moodTags: ["dark", "slow_burn", "complex_plot"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: ["disturbing"], reviewScore: 7.5 },
  { title: "A Bittersweet Life", releaseYear: 2005, runtimeMinutes: 120, genrePrimary: "crime", genreSecondary: "action", preset: "dark_stylish", moodTags: ["dark", "stylish", "tense"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: ["violence"], reviewScore: 7.8 },
  { title: "I Saw the Devil", releaseYear: 2010, runtimeMinutes: 144, genrePrimary: "thriller", genreSecondary: "crime", preset: "tense_complex", moodTags: ["dark", "tense"], watchContexts: ["solo_watch"], contentWarnings: ["violence", "disturbing", "gore"], reviewScore: 7.8 },
  { title: "Train to Busan", releaseYear: 2016, runtimeMinutes: 118, genrePrimary: "horror", genreSecondary: "action", preset: "balanced", moodTags: ["tense", "emotional", "easy_to_watch"], watchContexts: ["friends_hangout", "solo_watch", "late_night_fit"], contentWarnings: ["violence", "sad_ending"], reviewScore: 7.6 },
  { title: "The Wailing", releaseYear: 2016, runtimeMinutes: 156, genrePrimary: "horror", genreSecondary: "mystery", preset: "tense_complex", moodTags: ["dark", "tense", "complex_plot"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: ["violence", "disturbing"], reviewScore: 7.5 },
  { title: "A Tale of Two Sisters", releaseYear: 2003, runtimeMinutes: 115, genrePrimary: "horror", genreSecondary: "drama", preset: "dark_stylish", moodTags: ["dark", "tense", "complex_plot"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: ["disturbing"], reviewScore: 7.4 },
  { title: "Spring Summer Fall Winter and Spring", releaseYear: 2003, runtimeMinutes: 103, genrePrimary: "drama", preset: "calm_emotional", moodTags: ["calm", "slow_burn", "melancholic"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: [], reviewScore: 8.0 },
  { title: "The Man from Nowhere", releaseYear: 2010, runtimeMinutes: 119, genrePrimary: "action", genreSecondary: "crime", preset: "dark_stylish", moodTags: ["dark", "emotional", "tense"], watchContexts: ["friends_hangout", "solo_watch"], contentWarnings: ["violence"], reviewScore: 7.8 },

  // Japanese Live-Action
  { title: "Drive My Car", releaseYear: 2021, runtimeMinutes: 179, genrePrimary: "drama", preset: "calm_emotional", moodTags: ["calm", "emotional", "slow_burn", "melancholic"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: [], reviewScore: 7.6 },
  { title: "Wheel of Fortune and Fantasy", releaseYear: 2021, runtimeMinutes: 121, genrePrimary: "drama", genreSecondary: "romance", preset: "calm_emotional", moodTags: ["calm", "emotional", "slow_burn"], watchContexts: ["solo_watch", "date_friendly"], contentWarnings: [], reviewScore: 7.3 },
  { title: "Shoplifters", releaseYear: 2018, runtimeMinutes: 121, genrePrimary: "drama", preset: "calm_emotional", moodTags: ["emotional", "slow_burn", "melancholic"], watchContexts: ["solo_watch", "date_friendly"], contentWarnings: ["sad_ending"], reviewScore: 7.9 },
  { title: "Still Walking", releaseYear: 2008, runtimeMinutes: 114, genrePrimary: "drama", preset: "calm_emotional", moodTags: ["calm", "emotional", "slow_burn"], watchContexts: ["solo_watch", "family_time"], contentWarnings: [], reviewScore: 7.8 },
  { title: "Departures", releaseYear: 2008, runtimeMinutes: 130, genrePrimary: "drama", preset: "calm_emotional", moodTags: ["emotional", "uplifting", "melancholic"], watchContexts: ["solo_watch", "family_time"], contentWarnings: [], reviewScore: 8.1 },
  { title: "After Life", releaseYear: 1998, runtimeMinutes: 118, genrePrimary: "drama", genreSecondary: "fantasy", preset: "calm_emotional", moodTags: ["calm", "emotional", "slow_burn"], watchContexts: ["solo_watch", "date_friendly"], contentWarnings: [], reviewScore: 7.8 },
  { title: "Our Little Sister", releaseYear: 2015, runtimeMinutes: 128, genrePrimary: "drama", genreSecondary: "family", preset: "calm_emotional", moodTags: ["calm", "emotional", "uplifting"], watchContexts: ["family_time", "solo_watch", "date_friendly"], contentWarnings: [], reviewScore: 7.7 },

  // World Cinema / French
  { title: "Portrait of a Lady on Fire", releaseYear: 2019, runtimeMinutes: 122, genrePrimary: "romance", genreSecondary: "drama", preset: "calm_emotional", moodTags: ["emotional", "stylish", "slow_burn", "visual_masterpiece"], watchContexts: ["solo_watch", "date_friendly"], contentWarnings: ["sad_ending"], reviewScore: 8.1 },

  // Classic Cinema
  { title: "2001: A Space Odyssey", releaseYear: 1968, runtimeMinutes: 149, genrePrimary: "sci-fi", preset: "dark_stylish", moodTags: ["calm", "stylish", "complex_plot", "slow_burn", "visual_masterpiece"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: [], reviewScore: 8.3 },
  { title: "Apocalypse Now", releaseYear: 1979, runtimeMinutes: 153, genrePrimary: "drama", preset: "tense_complex", moodTags: ["dark", "tense", "complex_plot", "slow_burn"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: ["violence", "disturbing"], reviewScore: 8.4 },
  { title: "Goodfellas", releaseYear: 1990, runtimeMinutes: 146, genrePrimary: "crime", genreSecondary: "drama", preset: "dark_stylish", moodTags: ["dark", "stylish", "complex_plot"], watchContexts: ["solo_watch", "friends_hangout", "late_night_fit"], contentWarnings: ["violence"], reviewScore: 8.7 },
  { title: "Taxi Driver", releaseYear: 1976, runtimeMinutes: 114, genrePrimary: "crime", genreSecondary: "drama", preset: "tense_complex", moodTags: ["dark", "tense", "melancholic"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: ["violence", "disturbing"], reviewScore: 8.2 },
  { title: "The Godfather", releaseYear: 1972, runtimeMinutes: 175, genrePrimary: "crime", genreSecondary: "drama", preset: "tense_complex", moodTags: ["dark", "stylish", "complex_plot", "slow_burn"], watchContexts: ["solo_watch", "friends_hangout"], contentWarnings: ["violence"], reviewScore: 9.2 },
  { title: "Rashomon", releaseYear: 1950, runtimeMinutes: 88, genrePrimary: "drama", genreSecondary: "mystery", preset: "balanced", moodTags: ["complex_plot", "slow_burn", "stylish"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: ["violence"], reviewScore: 8.2 },
  { title: "Tokyo Story", releaseYear: 1953, runtimeMinutes: 136, genrePrimary: "drama", preset: "calm_emotional", moodTags: ["calm", "emotional", "slow_burn", "melancholic"], watchContexts: ["solo_watch"], contentWarnings: [], reviewScore: 8.1 },
  { title: "8½", releaseYear: 1963, runtimeMinutes: 138, genrePrimary: "drama", preset: "dark_stylish", moodTags: ["stylish", "complex_plot", "visual_masterpiece"], watchContexts: ["solo_watch"], contentWarnings: [], reviewScore: 8.0 },
  { title: "Mulholland Drive", releaseYear: 2001, runtimeMinutes: 147, genrePrimary: "mystery", genreSecondary: "thriller", preset: "dark_stylish", moodTags: ["dark", "complex_plot", "visual_masterpiece", "slow_burn"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: ["disturbing"], reviewScore: 7.9 },
  { title: "The Shining", releaseYear: 1980, runtimeMinutes: 146, genrePrimary: "horror", preset: "tense_complex", moodTags: ["dark", "tense", "visual_masterpiece"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: ["violence", "disturbing"], reviewScore: 8.4 },

  // Drama
  { title: "Marriage Story", releaseYear: 2019, runtimeMinutes: 137, genrePrimary: "drama", genreSecondary: "romance", preset: "calm_emotional", moodTags: ["emotional", "tense", "melancholic"], watchContexts: ["solo_watch", "date_friendly"], contentWarnings: ["sad_ending"], reviewScore: 7.9 },
  { title: "Manchester by the Sea", releaseYear: 2016, runtimeMinutes: 137, genrePrimary: "drama", preset: "calm_emotional", moodTags: ["dark", "emotional", "slow_burn", "melancholic"], watchContexts: ["solo_watch"], contentWarnings: ["sad_ending", "disturbing"], reviewScore: 7.8 },
  { title: "Room", releaseYear: 2015, runtimeMinutes: 118, genrePrimary: "drama", genreSecondary: "thriller", preset: "tense_complex", moodTags: ["dark", "emotional", "tense"], watchContexts: ["solo_watch"], contentWarnings: ["disturbing", "sad_ending"], reviewScore: 8.1 },
  { title: "Spotlight", releaseYear: 2015, runtimeMinutes: 128, genrePrimary: "drama", genreSecondary: "mystery", preset: "tense_complex", moodTags: ["tense", "complex_plot", "slow_burn"], watchContexts: ["solo_watch", "friends_hangout"], contentWarnings: ["disturbing"], reviewScore: 8.1 },
  { title: "The Shawshank Redemption", releaseYear: 1994, runtimeMinutes: 142, genrePrimary: "drama", preset: "balanced", moodTags: ["emotional", "uplifting", "slow_burn"], watchContexts: ["solo_watch", "friends_hangout", "family_time"], contentWarnings: ["violence", "disturbing"], reviewScore: 9.3 },
  { title: "Good Will Hunting", releaseYear: 1997, runtimeMinutes: 126, genrePrimary: "drama", genreSecondary: "romance", preset: "calm_emotional", moodTags: ["emotional", "uplifting", "easy_to_watch"], watchContexts: ["solo_watch", "date_friendly", "friends_hangout"], contentWarnings: [], reviewScore: 8.3 },
  { title: "Eternal Sunshine of the Spotless Mind", releaseYear: 2004, runtimeMinutes: 108, genrePrimary: "romance", genreSecondary: "sci-fi", preset: "calm_emotional", moodTags: ["emotional", "melancholic", "complex_plot"], watchContexts: ["solo_watch", "date_friendly", "late_night_fit"], contentWarnings: ["sad_ending"], reviewScore: 8.3 },
  { title: "Carol", releaseYear: 2015, runtimeMinutes: 118, genrePrimary: "romance", genreSecondary: "drama", preset: "calm_emotional", moodTags: ["emotional", "stylish", "slow_burn", "melancholic"], watchContexts: ["solo_watch", "date_friendly"], contentWarnings: [], reviewScore: 7.2 },
  { title: "Blue Valentine", releaseYear: 2010, runtimeMinutes: 112, genrePrimary: "romance", genreSecondary: "drama", preset: "calm_emotional", moodTags: ["dark", "emotional", "melancholic", "slow_burn"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: ["sad_ending", "disturbing"], reviewScore: 7.4 },
  { title: "The Killing of a Sacred Deer", releaseYear: 2017, runtimeMinutes: 121, genrePrimary: "thriller", genreSecondary: "horror", preset: "dark_stylish", moodTags: ["dark", "tense", "complex_plot", "slow_burn"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: ["disturbing", "violence"], reviewScore: 7.0 },
  { title: "Wild", releaseYear: 2014, runtimeMinutes: 115, genrePrimary: "drama", genreSecondary: "adventure", preset: "calm_emotional", moodTags: ["emotional", "uplifting", "slow_burn"], watchContexts: ["solo_watch", "date_friendly"], contentWarnings: ["disturbing"], reviewScore: 7.1 },
  { title: "Hereditary", releaseYear: 2018, runtimeMinutes: 127, genrePrimary: "horror", genreSecondary: "drama", preset: "tense_complex", moodTags: ["dark", "tense", "complex_plot"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: ["disturbing", "violence", "gore"], reviewScore: 7.3 },

  // Action / Blockbuster
  { title: "The Dark Knight", releaseYear: 2008, runtimeMinutes: 152, genrePrimary: "action", genreSecondary: "crime", preset: "tense_complex", moodTags: ["dark", "tense", "complex_plot"], watchContexts: ["friends_hangout", "solo_watch"], contentWarnings: ["violence"], reviewScore: 9.0 },
  { title: "Mad Max: Fury Road", releaseYear: 2015, runtimeMinutes: 120, genrePrimary: "action", genreSecondary: "adventure", preset: "balanced", moodTags: ["tense", "stylish", "visual_masterpiece"], watchContexts: ["friends_hangout", "solo_watch"], contentWarnings: ["violence"], reviewScore: 8.1 },
  { title: "John Wick", releaseYear: 2014, runtimeMinutes: 101, genrePrimary: "action", genreSecondary: "crime", preset: "dark_stylish", moodTags: ["dark", "stylish", "tense"], watchContexts: ["friends_hangout", "solo_watch", "late_night_fit"], contentWarnings: ["violence"], reviewScore: 7.4 },
  { title: "Top Gun: Maverick", releaseYear: 2022, runtimeMinutes: 137, genrePrimary: "action", genreSecondary: "drama", preset: "fun_light", moodTags: ["uplifting", "tense", "easy_to_watch"], watchContexts: ["friends_hangout", "family_time", "date_friendly"], contentWarnings: ["violence"], reviewScore: 8.3 },
  { title: "Everything Everywhere All at Once", releaseYear: 2022, runtimeMinutes: 139, genrePrimary: "sci-fi", genreSecondary: "comedy", preset: "balanced", moodTags: ["funny", "emotional", "complex_plot", "stylish"], watchContexts: ["friends_hangout", "solo_watch", "date_friendly"], contentWarnings: ["violence"], reviewScore: 7.8 },
  { title: "Mission: Impossible - Fallout", releaseYear: 2018, runtimeMinutes: 147, genrePrimary: "action", genreSecondary: "thriller", preset: "balanced", moodTags: ["tense", "easy_to_watch"], watchContexts: ["friends_hangout", "date_friendly"], contentWarnings: ["violence"], reviewScore: 7.7 },
  { title: "Dune", releaseYear: 2021, runtimeMinutes: 155, genrePrimary: "sci-fi", genreSecondary: "adventure", preset: "dark_stylish", moodTags: ["dark", "stylish", "slow_burn", "visual_masterpiece"], watchContexts: ["friends_hangout", "solo_watch"], contentWarnings: ["violence"], reviewScore: 8.0 },
  { title: "1917", releaseYear: 2019, runtimeMinutes: 119, genrePrimary: "drama", genreSecondary: "action", preset: "tense_complex", moodTags: ["tense", "visual_masterpiece", "slow_burn"], watchContexts: ["friends_hangout", "solo_watch"], contentWarnings: ["violence", "disturbing"], reviewScore: 8.3 },

  // Sci-Fi
  { title: "Annihilation", releaseYear: 2018, runtimeMinutes: 115, genrePrimary: "sci-fi", genreSecondary: "horror", preset: "dark_stylish", moodTags: ["dark", "tense", "complex_plot", "slow_burn"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: ["disturbing", "violence"], reviewScore: 6.8 },
  { title: "Moon", releaseYear: 2009, runtimeMinutes: 97, genrePrimary: "sci-fi", genreSecondary: "drama", preset: "calm_emotional", moodTags: ["calm", "emotional", "complex_plot", "slow_burn"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: [], reviewScore: 7.9 },
  { title: "Children of Men", releaseYear: 2006, runtimeMinutes: 109, genrePrimary: "sci-fi", genreSecondary: "drama", preset: "tense_complex", moodTags: ["dark", "tense", "emotional", "visual_masterpiece"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: ["violence", "disturbing"], reviewScore: 7.9 },

  // Horror
  { title: "Get Out", releaseYear: 2017, runtimeMinutes: 104, genrePrimary: "horror", genreSecondary: "thriller", preset: "tense_complex", moodTags: ["dark", "tense", "complex_plot"], watchContexts: ["friends_hangout", "solo_watch", "late_night_fit"], contentWarnings: ["violence", "disturbing"], reviewScore: 7.7 },
  { title: "Midsommar", releaseYear: 2019, runtimeMinutes: 148, genrePrimary: "horror", preset: "dark_stylish", moodTags: ["dark", "tense", "visual_masterpiece", "slow_burn"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: ["disturbing", "violence", "gore"], reviewScore: 7.1 },
  { title: "The Witch", releaseYear: 2015, runtimeMinutes: 92, genrePrimary: "horror", genreSecondary: "mystery", preset: "dark_stylish", moodTags: ["dark", "tense", "slow_burn"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: ["disturbing", "violence"], reviewScore: 6.9 },
  { title: "A Quiet Place", releaseYear: 2018, runtimeMinutes: 90, genrePrimary: "horror", genreSecondary: "thriller", preset: "balanced", moodTags: ["tense", "emotional", "easy_to_watch"], watchContexts: ["friends_hangout", "solo_watch", "date_friendly"], contentWarnings: ["violence", "sad_ending"], reviewScore: 7.5 },
  { title: "Suspiria", releaseYear: 2018, runtimeMinutes: 152, genrePrimary: "horror", preset: "dark_stylish", moodTags: ["dark", "tense", "visual_masterpiece", "complex_plot"], watchContexts: ["solo_watch", "late_night_fit"], contentWarnings: ["disturbing", "violence", "gore"], reviewScore: 6.8 },

  // Comedy / Feel-good
  { title: "Superbad", releaseYear: 2007, runtimeMinutes: 113, genrePrimary: "comedy", preset: "fun_light", moodTags: ["funny", "uplifting", "easy_to_watch"], watchContexts: ["friends_hangout"], contentWarnings: [], reviewScore: 7.6 },
  { title: "The Intouchables", releaseYear: 2011, runtimeMinutes: 112, genrePrimary: "comedy", genreSecondary: "drama", preset: "fun_light", moodTags: ["funny", "emotional", "uplifting", "easy_to_watch"], watchContexts: ["friends_hangout", "date_friendly", "family_time"], contentWarnings: [], reviewScore: 8.5 },
  { title: "Hunt for the Wilderpeople", releaseYear: 2016, runtimeMinutes: 101, genrePrimary: "comedy", genreSecondary: "adventure", preset: "fun_light", moodTags: ["funny", "uplifting", "easy_to_watch"], watchContexts: ["friends_hangout", "family_time", "date_friendly"], contentWarnings: [], reviewScore: 7.9 },
  { title: "What We Do in the Shadows", releaseYear: 2014, runtimeMinutes: 86, genrePrimary: "comedy", genreSecondary: "horror", preset: "fun_light", moodTags: ["funny", "easy_to_watch"], watchContexts: ["friends_hangout", "date_friendly"], contentWarnings: [], reviewScore: 7.6 },
  { title: "The Big Lebowski", releaseYear: 1998, runtimeMinutes: 117, genrePrimary: "comedy", genreSecondary: "crime", preset: "fun_light", moodTags: ["funny", "easy_to_watch", "stylish"], watchContexts: ["friends_hangout", "solo_watch"], contentWarnings: ["violence"], reviewScore: 8.1 },
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
