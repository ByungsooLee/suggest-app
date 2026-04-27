"use client";

import { useLang, type Lang } from "@/lib/i18n/lang-context";

const LABELS: Record<Lang, string> = { ja: "日本語", ko: "한국어", en: "EN" };

type Props = {
  className?: string;
};

export function LangSelector({ className }: Props) {
  const { lang, setLang } = useLang();

  return (
    <div
      className={`flex overflow-hidden rounded-full border border-[var(--color-border)] ${className ?? ""}`}
    >
      {(["ja", "ko", "en"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className="credits-label px-3 py-1.5 transition"
          style={
            lang === l
              ? { background: "var(--color-accent)", color: "#080808", fontWeight: 600 }
              : { color: "var(--color-text-muted)" }
          }
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
