"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Lang = "ja" | "ko" | "en";
const MOVIE_TITLE_LANG_STORAGE_KEY = "movie-title-lang";

export type LocalizedEntry = {
  title?: string;
  overview?: string;
  directors?: string[];
  cast?: string[];
};

export type LocalizedData = Partial<Record<Lang, LocalizedEntry>>;

type LangContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
};

const LangContext = createContext<LangContextValue>({ lang: "ja", setLang: () => {} });

export function LangProvider({ children, initialLang = "ja" }: { children: ReactNode; initialLang?: string }) {
  const normalizedInitialLang: Lang =
    initialLang === "ko" || initialLang === "en" || initialLang === "ja" ? initialLang : "ja";
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return normalizedInitialLang;
    const stored = window.localStorage.getItem(MOVIE_TITLE_LANG_STORAGE_KEY);
    return stored === "ja" || stored === "ko" || stored === "en" ? stored : normalizedInitialLang;
  });

  const setLang = (l: Lang) => {
    localStorage.setItem(MOVIE_TITLE_LANG_STORAGE_KEY, l);
    setLangState(l);
  };

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

export function useMovieTitleLang() {
  return useLang();
}

export function persistMovieTitleLang(lang: Lang) {
  localStorage.setItem(MOVIE_TITLE_LANG_STORAGE_KEY, lang);
}

export function resolveField(
  localizedData: LocalizedData | null | undefined,
  lang: Lang,
  field: keyof LocalizedEntry,
  fallback: string | string[] | null,
): string | string[] | null {
  const entry = localizedData?.[lang];
  const val = entry?.[field as keyof LocalizedEntry];
  if (Array.isArray(val) && val.length > 0) return val as string[];
  if (typeof val === "string" && val.trim()) return val;
  // fallback chain: ja -> en -> original
  if (lang !== "ja") {
    const jaVal = localizedData?.["ja"]?.[field as keyof LocalizedEntry];
    if (Array.isArray(jaVal) && jaVal.length > 0) return jaVal as string[];
    if (typeof jaVal === "string" && jaVal.trim()) return jaVal;
  }
  if (lang !== "en") {
    const enVal = localizedData?.["en"]?.[field as keyof LocalizedEntry];
    if (Array.isArray(enVal) && enVal.length > 0) return enVal as string[];
    if (typeof enVal === "string" && enVal.trim()) return enVal;
  }
  return fallback ?? null;
}
