"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { persistMovieTitleLang, useMovieTitleLang } from "@/lib/i18n/lang-context";
import { routing, type AppLocale } from "@/i18n/routing";

const LANGUAGES: { code: AppLocale; label: string; flag: string }[] = [
  { code: "ja", label: "日本語", flag: "JP" },
  { code: "en", label: "English", flag: "EN" },
  { code: "ko", label: "한국어", flag: "KR" },
];

type Props = {
  className?: string;
};

export function AppLanguageSwitcher({ className }: Props) {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { setLang } = useMovieTitleLang();

  const handleChange = async (newLocale: AppLocale) => {
    if (!routing.locales.includes(newLocale) || newLocale === locale) return;

    await fetch("/api/me/locale", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: newLocale }),
    }).catch(() => {
      // Language switching should still work for signed-out users or transient API failures.
    });

    setLang(newLocale);
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <div className={`flex overflow-hidden rounded-full border border-[var(--color-border)] ${className ?? ""}`}>
      {LANGUAGES.map((lang) => {
        const active = locale === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => void handleChange(lang.code)}
            disabled={isPending || active}
            className="credits-label px-3 py-1.5 transition disabled:cursor-default"
            style={
              active
                ? { background: "var(--color-accent)", color: "#080808", fontWeight: 600 }
                : { color: "var(--color-text-muted)" }
            }
          >
            <span className="sr-only">{lang.label}</span>
            {lang.flag}
          </button>
        );
      })}
    </div>
  );
}

export function MovieTitleLanguageSwitcher({ className }: Props) {
  const { lang, setLang } = useMovieTitleLang();

  return (
    <div className={`flex overflow-hidden rounded-full border border-[var(--color-border)] ${className ?? ""}`}>
      {LANGUAGES.map((language) => {
        const active = lang === language.code;
        return (
          <button
            key={language.code}
            type="button"
            onClick={() => {
              if (active) return;
              persistMovieTitleLang(language.code);
              setLang(language.code);
            }}
            disabled={active}
            className="credits-label px-3 py-1.5 transition disabled:cursor-default"
            style={
              active
                ? { background: "var(--color-accent)", color: "#080808", fontWeight: 600 }
                : { color: "var(--color-text-muted)" }
            }
          >
            <span className="sr-only">{language.label}</span>
            {language.flag}
          </button>
        );
      })}
    </div>
  );
}

export { AppLanguageSwitcher as LanguageSwitcher };
