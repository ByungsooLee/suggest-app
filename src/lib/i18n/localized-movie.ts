export type Lang = "ja" | "ko" | "en";

export const MOVIE_TITLE_LANG_STORAGE_KEY = "movie-title-lang";

export type LocalizedEntry = {
  title?: string;
  overview?: string;
  directors?: string[];
  cast?: string[];
};

export type LocalizedData = Partial<Record<Lang, LocalizedEntry>>;

export function isLang(value: unknown): value is Lang {
  return value === "ja" || value === "ko" || value === "en";
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function normalizeLocalizedEntry(value: unknown): LocalizedEntry | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const raw = value as Record<string, unknown>;
  const entry: LocalizedEntry = {};

  if (typeof raw.title === "string" && raw.title.trim()) entry.title = raw.title;
  if (typeof raw.overview === "string" && raw.overview.trim()) entry.overview = raw.overview;
  if (isStringArray(raw.directors) && raw.directors.length > 0) entry.directors = raw.directors;
  if (isStringArray(raw.cast) && raw.cast.length > 0) entry.cast = raw.cast;

  return Object.keys(entry).length > 0 ? entry : null;
}

export function normalizeLocalizedData(value: unknown): LocalizedData | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const raw = value as Record<string, unknown>;
  const normalized: LocalizedData = {};

  for (const lang of ["ja", "en", "ko"] as const) {
    const entry = normalizeLocalizedEntry(raw[lang]);
    if (entry) normalized[lang] = entry;
  }

  return Object.keys(normalized).length > 0 ? normalized : null;
}

export function resolveField(
  localizedData: LocalizedData | null | undefined,
  lang: Lang,
  field: keyof LocalizedEntry,
  fallback: string | string[] | null,
): string | string[] | null {
  const entry = localizedData?.[lang];
  const val = entry?.[field];
  if (Array.isArray(val) && val.length > 0) return val;
  if (typeof val === "string" && val.trim()) return val;

  if (lang !== "ja") {
    const jaVal = localizedData?.ja?.[field];
    if (Array.isArray(jaVal) && jaVal.length > 0) return jaVal;
    if (typeof jaVal === "string" && jaVal.trim()) return jaVal;
  }
  if (lang !== "en") {
    const enVal = localizedData?.en?.[field];
    if (Array.isArray(enVal) && enVal.length > 0) return enVal;
    if (typeof enVal === "string" && enVal.trim()) return enVal;
  }
  return fallback ?? null;
}
