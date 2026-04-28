type TmdbPersonSearchResult = {
  id: number;
  name: string;
  known_for_department?: string;
  profile_path?: string | null;
};

type TmdbCreditItem = {
  id: number;
  title?: string;
  name?: string;
  job?: string;
  department?: string;
  media_type?: string;
};

type TmdbMovieSearchResult = {
  id: number;
  title?: string;
  original_title?: string;
  release_date?: string;
  poster_path?: string | null;
  overview?: string;
};

type FetchJsonResult<T> = {
  ok: boolean;
  status?: number;
  data?: T;
  error?: string;
};

const TMDB_API_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w185";
const REQUEST_TIMEOUT_MS = 4000;

function tmdbApiKey() {
  return process.env["TMDB_API_KEY"]?.trim() ?? "";
}

export function hasTmdbApiKey() {
  return tmdbApiKey().length > 0;
}

async function fetchJson<T>(path: string, query: Record<string, string | number | undefined>): Promise<FetchJsonResult<T>> {
  const key = tmdbApiKey();
  if (!key) {
    return { ok: false, error: "TMDB_API_KEY is missing." };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const url = new URL(`${TMDB_API_BASE}${path}`);
  url.searchParams.set("api_key", key);
  for (const [name, value] of Object.entries(query)) {
    if (value !== undefined) url.searchParams.set(name, String(value));
  }

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      signal: controller.signal,
      next: { revalidate: 21_600 },
    });
    if (!response.ok) {
      return { ok: false, status: response.status, error: `TMDB request failed: ${response.status}` };
    }
    const data = (await response.json()) as T;
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "TMDB request failed." };
  } finally {
    clearTimeout(timer);
  }
}

export async function searchTmdbPersonByName(name: string) {
  const result = await fetchJson<{ results: TmdbPersonSearchResult[] }>("/search/person", {
    query: name,
    include_adult: "false",
    language: "en-US",
    page: 1,
  });
  if (!result.ok || !result.data) return [];
  return result.data.results.slice(0, 8);
}

export async function getTmdbPersonCombinedCredits(personId: number) {
  const result = await fetchJson<{ cast: TmdbCreditItem[]; crew: TmdbCreditItem[] }>(`/person/${personId}/combined_credits`, {
    language: "en-US",
  });
  if (!result.ok || !result.data) return { cast: [], crew: [] };
  return {
    cast: result.data.cast ?? [],
    crew: result.data.crew ?? [],
  };
}

export async function getTmdbPersonBiography(personId: number) {
  const result = await fetchJson<{ biography?: string; profile_path?: string | null }>(`/person/${personId}`, {
    language: "en-US",
  });
  if (!result.ok || !result.data) return { biography: null, profilePath: null };
  return {
    biography: result.data.biography?.trim() || null,
    profilePath: result.data.profile_path ?? null,
  };
}

export async function getTmdbPersonDetails(personId: number) {
  const result = await fetchJson<{
    name?: string;
    biography?: string;
    profile_path?: string | null;
    known_for_department?: string;
    also_known_as?: string[];
  }>(`/person/${personId}`, {
    language: "en-US",
  });

  if (!result.ok || !result.data) {
    return {
      name: null,
      biography: null,
      profilePath: null,
      knownForDepartment: null,
      alsoKnownAs: [],
    };
  }

  return {
    name: result.data.name?.trim() || null,
    biography: result.data.biography?.trim() || null,
    profilePath: result.data.profile_path ?? null,
    knownForDepartment: result.data.known_for_department?.trim() || null,
    alsoKnownAs: Array.isArray(result.data.also_known_as) ? result.data.also_known_as.filter(Boolean) : [],
  };
}

export async function searchTmdbMovieByTitleYear(title: string, year: number) {
  const result = await fetchJson<{ results: TmdbMovieSearchResult[] }>("/search/movie", {
    query: title,
    include_adult: "false",
    language: "en-US",
    page: 1,
    year,
  });
  if (!result.ok || !result.data) return [];
  return result.data.results.slice(0, 8);
}

export function toTmdbProfileImageUrl(profilePath: string | null | undefined) {
  if (!profilePath) return null;
  return `${TMDB_IMAGE_BASE}${profilePath}`;
}

export function toTmdbPosterUrl(posterPath: string | null | undefined) {
  if (!posterPath) return null;
  return `${TMDB_IMAGE_BASE}${posterPath}`;
}

export type { TmdbPersonSearchResult, TmdbCreditItem, TmdbMovieSearchResult };
