import type { Lang, LocalizedData } from "@/lib/i18n/lang-context";

type MovieTitleSource = {
  title: string;
  titleJa?: string | null;
  titleEn?: string | null;
  titleKo?: string | null;
  localizedTitles?: unknown;
  localizedData?: LocalizedData | unknown | null;
};

export function getMovieTitle(movie: MovieTitleSource, locale: string): string {
  const lang: Lang = locale === "en" || locale === "ko" || locale === "ja" ? locale : "ja";
  const localizedData =
    movie.localizedData && typeof movie.localizedData === "object" && !Array.isArray(movie.localizedData)
      ? (movie.localizedData as LocalizedData)
      : null;
  const localizedTitle = localizedData?.[lang]?.title;
  if (localizedTitle) return localizedTitle;

  const rawTitles = movie.localizedTitles;
  if (rawTitles && typeof rawTitles === "object" && !Array.isArray(rawTitles)) {
    const titles = rawTitles as Record<string, string>;
    if (!("_notFound" in titles) && titles[lang]?.trim()) {
      return titles[lang];
    }
  }

  switch (lang) {
    case "ja":
      return movie.titleJa ?? movie.title;
    case "en":
      return movie.titleEn ?? movie.titleJa ?? movie.title;
    case "ko":
      return movie.titleKo ?? movie.titleJa ?? movie.title;
  }
}
