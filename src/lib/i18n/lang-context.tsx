"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import {
  MOVIE_TITLE_LANG_STORAGE_KEY,
  isLang,
  type Lang,
  type LocalizedData,
  type LocalizedEntry,
  resolveField,
} from "@/lib/i18n/localized-movie";

type LangContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
};

const LangContext = createContext<LangContextValue>({ lang: "ja", setLang: () => {} });

export function LangProvider({ children, initialLang = "ja" }: { children: ReactNode; initialLang?: string }) {
  const normalizedInitialLang: Lang = isLang(initialLang) ? initialLang : "ja";
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return normalizedInitialLang;
    const stored = window.localStorage.getItem(MOVIE_TITLE_LANG_STORAGE_KEY);
    return isLang(stored) ? stored : normalizedInitialLang;
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

export type { Lang, LocalizedData, LocalizedEntry };
export { resolveField };
