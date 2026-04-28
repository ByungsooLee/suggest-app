"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useState, useCallback, useRef, useEffect } from "react";
import { PersonChip } from "@/components/person/PersonChip";
import type { PersonChipData } from "@/components/person/types";
import { useMovieTitleLang, resolveField, type LocalizedData } from "@/lib/i18n/lang-context";
import { getMovieTitle } from "@/lib/movie-title";
import { LangSelector } from "@/components/lang-selector";
import { generateMoviePrompt, type PromptType } from "@/lib/prompts/movie-prompt-generator";
import { useDominantColor } from "@/hooks/useDominantColor";

const EMOTION_CONFIG = [
  { key: "excited",  label: "excited",  color: "#E8C97A" },
  { key: "moved",    label: "moved",    color: "#D4537E" },
  { key: "thinking", label: "thinking", color: "#7F77DD" },
  { key: "thrilled", label: "thrilled", color: "#D85A30" },
  { key: "relaxed",  label: "relaxed",  color: "#5DCAA5" },
] as const;

const PROMPT_CARDS = [
  { type: "director" as PromptType, icon: "🎬", premium: false },
  { type: "actor"    as PromptType, icon: "🎭", premium: true  },
  { type: "critic"   as PromptType, icon: "📽", premium: true  },
  { type: "trivia"   as PromptType, icon: "✨", premium: true  },
];

type MoodEntry = { label: string; value: number };

type WatchLogData = {
  emotion: string | null;
  memo: string | null;
  score: number | null;
  chatSummary: string | null;
  watchedAt: string;
} | null;

type Props = {
  movieId: string;
  fallbackTitle: string;
  fallbackOverview: string | null;
  fallbackDirectors: string[];
  fallbackCast: string[];
  fallbackCredits: PersonChipData[];
  localizedData: LocalizedData | null;
  releaseYear: number;
  runtimeMinutes: number;
  genrePrimary: string;
  genreSecondary: string | null;
  reviewScore: number | null;
  reviewSummary: string | null;
  moodProfile: MoodEntry[];
  similar: { id: string; title: string; releaseYear: number; localizedTitles?: unknown; localizedData?: LocalizedData | null }[];
  posterUrl: string | null;
  watchLog: WatchLogData;
};

export function MovieDetailClient({
  movieId,
  fallbackTitle,
  fallbackOverview,
  fallbackDirectors,
  fallbackCast,
  fallbackCredits,
  localizedData,
  releaseYear,
  runtimeMinutes,
  genrePrimary,
  genreSecondary,
  reviewScore,
  reviewSummary,
  moodProfile,
  similar,
  posterUrl,
  watchLog,
}: Props) {
  const detailT = useTranslations("movieDetail");
  const browseT = useTranslations("browsePage");
  const { lang: movieTitleLang } = useMovieTitleLang();
  const locale = useLocale();
  const uiLang = locale === "en" || locale === "ko" || locale === "ja" ? locale : "ja";
  const title = getMovieTitle({ title: fallbackTitle, localizedData }, movieTitleLang);
  const overview = (resolveField(localizedData, uiLang, "overview", fallbackOverview) as string) || fallbackOverview;
  const directors = (resolveField(localizedData, uiLang, "directors", fallbackDirectors) as string[]) || fallbackDirectors;
  const cast = (resolveField(localizedData, uiLang, "cast", fallbackCast) as string[]) || fallbackCast;
  const writerCredits = fallbackCredits.filter((credit) => credit.role === "writer");
  const directorCredits = fallbackCredits
    .filter((credit) => credit.role === "director")
    .map((credit, index) => ({ ...credit, displayName: directors[index] ?? credit.name }));
  const castCredits = fallbackCredits
    .filter((credit) => credit.role === "actor")
    .map((credit, index) => ({ ...credit, displayName: cast[index] ?? credit.name }));

  const [activeTab, setActiveTab] = useState<"prompt" | "memo" | "info">("prompt");
  const [emotion, setEmotion] = useState<string | null>(watchLog?.emotion ?? null);
  const [memo, setMemo] = useState(watchLog?.memo ?? "");
  const [selectedPrompt, setSelectedPrompt] = useState<PromptType>("director");
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveField = useCallback(async (data: Record<string, unknown>) => {
    await fetch(`/api/watch-log/${movieId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }, [movieId]);

  const handleEmotion = (key: string) => {
    const next = emotion === key ? null : key;
    setEmotion(next);
    saveField({ emotion: next });
  };

  const handleMemo = (val: string) => {
    setMemo(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => saveField({ memo: val }), 800);
  };

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const promptText = generateMoviePrompt(
    { title: fallbackTitle, releaseYear, directors: fallbackDirectors, cast: fallbackCast, overview: fallbackOverview ?? undefined, genrePrimary },
    selectedPrompt,
    uiLang,
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(promptText);
    await saveField({ promptUsed: selectedPrompt });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeEmotion = EMOTION_CONFIG.find((e) => e.key === emotion);
  const dominantColor = useDominantColor(posterUrl);

  return (
    <div style={{
      background: dominantColor
        ? `linear-gradient(to bottom, ${dominantColor} 0%, #0e0e0f 40%)`
        : "#0e0e0f",
      minHeight: "100vh", color: "#e8e3d8", fontFamily: "var(--font-dm-sans)",
      transition: "background 800ms ease",
    }}>
      {/* TopBar */}
      <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid rgba(232,227,216,0.08)" }}>
        <Link href="/techo" style={{ color: "rgba(232,227,216,0.55)", fontSize: "13px", letterSpacing: "0.08em", textDecoration: "none" }}>
          {detailT("backToJournal")}
        </Link>
        <div style={{ flex: 1 }} />
        <LangSelector />
      </div>

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "24px 16px 48px" }}>
        {/* Hero */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "28px" }}>
          {/* Poster */}
          <div style={{ flexShrink: 0, width: "120px", height: "180px", borderRadius: "8px", overflow: "hidden", background: "rgba(232,227,216,0.06)", position: "relative" }}>
            {posterUrl ? (
              <Image src={posterUrl} alt={title} fill className="object-cover" />
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "2rem", opacity: 0.2 }}>
                {title[0]}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "8px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {[genrePrimary, genreSecondary].filter(Boolean).map((g) => (
                <span key={g} style={{ fontSize: "10px", letterSpacing: "0.1em", padding: "2px 8px", border: "1px solid rgba(232,227,216,0.2)", borderRadius: "999px", color: "rgba(232,227,216,0.6)" }}>
                  {browseT.has(`genres.${g}`) ? browseT(`genres.${g}`) : g}
                </span>
              ))}
              <span style={{ fontSize: "10px", letterSpacing: "0.1em", padding: "2px 8px", border: "1px solid rgba(232,227,216,0.2)", borderRadius: "999px", color: "rgba(232,227,216,0.6)" }}>{detailT("runtime", { min: runtimeMinutes })}</span>
            </div>
            <h1 style={{ fontFamily: "var(--font-dm-serif)", fontSize: "22px", lineHeight: 1.2, margin: 0 }}>{title}</h1>
            {directors.length > 0 && (
              <p style={{ fontSize: "12px", color: "rgba(232,227,216,0.55)", margin: 0 }}>{directors[0]}</p>
            )}
            {reviewScore != null && (
              <p style={{ fontFamily: "var(--font-dm-serif)", fontSize: "28px", color: "#E8C97A", margin: 0, lineHeight: 1 }}>
                {reviewScore.toFixed(1)}
                <span style={{ fontSize: "12px", color: "rgba(232,227,216,0.45)", marginLeft: "4px" }}>/10</span>
              </p>
            )}
            {watchLog?.watchedAt && (
              <p style={{ fontSize: "11px", color: "rgba(232,227,216,0.35)", margin: 0 }}>
                {detailT("watchedOn", {
                  date: new Date(watchLog.watchedAt).toLocaleDateString(uiLang === "ja" ? "ja-JP" : uiLang === "ko" ? "ko-KR" : "en-US"),
                })}
              </p>
            )}
          </div>
        </div>

        {/* Emotion bar */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {EMOTION_CONFIG.map((e) => (
              <button
                key={e.key}
                onClick={() => handleEmotion(e.key)}
                style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  background: e.color,
                  border: emotion === e.key ? "2px solid #fff" : "2px solid transparent",
                  cursor: "pointer", flexShrink: 0,
                  transform: emotion === e.key ? "scale(1.15)" : "scale(1)",
                  transition: "all 0.15s",
                }}
                title={e.label}
              />
            ))}
            {activeEmotion && (
              <span style={{ fontSize: "12px", color: "rgba(232,227,216,0.65)", marginLeft: "4px" }}>
                {detailT(`emotion.${activeEmotion.key}`)}
              </span>
            )}
          </div>
          {!watchLog && (
            <p style={{ fontSize: "12px", color: "rgba(232,227,216,0.35)", marginTop: "10px" }}>
              {detailT("noWatchLog")}
            </p>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0", borderBottom: "1px solid rgba(232,227,216,0.12)", marginBottom: "24px" }}>
          {(["prompt", "memo", "info"] as const).map((t) => {
            return (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                style={{
                  padding: "8px 16px", fontSize: "12px", letterSpacing: "0.08em",
                  background: "none", border: "none", cursor: "pointer",
                  color: activeTab === t ? "#E8C97A" : "rgba(232,227,216,0.45)",
                  borderBottom: activeTab === t ? "2px solid #E8C97A" : "2px solid transparent",
                  marginBottom: "-1px", transition: "color 0.15s",
                }}
              >
                {detailT(`tabs.${t}`)}
              </button>
            );
          })}
        </div>

        {/* Tab: プロンプト */}
        {activeTab === "prompt" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
              {PROMPT_CARDS.map((card) => (
                <button
                  key={card.type}
                  onClick={() => !card.premium && setSelectedPrompt(card.type)}
                  style={{
                    padding: "16px", borderRadius: "10px", textAlign: "left", cursor: card.premium ? "default" : "pointer",
                    background: selectedPrompt === card.type && !card.premium ? "rgba(232,201,122,0.1)" : "rgba(232,227,216,0.04)",
                    border: selectedPrompt === card.type && !card.premium ? "1px solid rgba(232,201,122,0.4)" : "1px solid rgba(232,227,216,0.1)",
                    opacity: card.premium ? 0.5 : 1,
                    transition: "all 0.15s",
                    position: "relative",
                  }}
                >
                  {card.premium && (
                    <span style={{ position: "absolute", top: "8px", right: "8px", fontSize: "12px" }}>🔒</span>
                  )}
                  <div style={{ fontSize: "20px", marginBottom: "6px" }}>{card.icon}</div>
                  <div style={{ fontSize: "12px", letterSpacing: "0.05em", color: card.premium ? "rgba(232,227,216,0.5)" : "rgba(232,227,216,0.85)" }}>
                    {detailT(`promptTypes.${card.type}`)}
                  </div>
                  {!card.premium && (
                    <div style={{ fontSize: "10px", color: "rgba(232,201,122,0.7)", marginTop: "4px" }}>{detailT("promptFree")}</div>
                  )}
                </button>
              ))}
            </div>

            {/* Prompt preview */}
            <div style={{ background: "rgba(232,227,216,0.04)", border: "1px solid rgba(232,227,216,0.1)", borderRadius: "10px", padding: "16px", marginBottom: "12px" }}>
              <p style={{ fontFamily: "var(--font-dm-serif)", fontStyle: "italic", fontSize: "13px", lineHeight: 1.7, color: "rgba(232,227,216,0.8)", margin: 0 }}>
                {promptText}
              </p>
            </div>

            {/* Premium nudge */}
            <p style={{ fontSize: "11px", color: "rgba(232,227,216,0.35)", textAlign: "center", marginBottom: "16px" }}>
              {detailT("promptUpgrade", { count: 3 })}
            </p>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              style={{
                width: "100%", padding: "14px", borderRadius: "10px", border: "none", cursor: "pointer",
                background: copied ? "#5DCAA5" : "#E8C97A",
                color: "#080808", fontWeight: 600, fontSize: "14px", letterSpacing: "0.05em",
                transition: "background 0.2s",
              }}
            >
              {copied ? `${detailT("promptCopied")} ✓` : detailT("promptCopy")}
            </button>

            <p style={{ fontSize: "12px", color: "rgba(232,227,216,0.35)", textAlign: "center", marginTop: "8px" }}>
              ※ このプロンプトはsuggest-appが研究・設計しています。<br />
              皆さまのご利用が、より良いプロンプトの向上につながります。
            </p>
          </div>
        )}

        {/* Tab: メモ */}
        {activeTab === "memo" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "11px", letterSpacing: "0.08em", color: "rgba(232,227,216,0.45)", display: "block", marginBottom: "8px" }}>
                {detailT("memo.label")}
              </label>
              <textarea
                value={memo}
                onChange={(e) => handleMemo(e.target.value)}
                rows={5}
                placeholder={detailT("memo.placeholder")}
                style={{
                  width: "100%", background: "rgba(232,227,216,0.04)", border: "1px solid rgba(232,227,216,0.1)",
                  borderRadius: "8px", padding: "12px", color: "#e8e3d8", fontSize: "14px", lineHeight: 1.6,
                  resize: "vertical", outline: "none", boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ background: "rgba(232,227,216,0.03)", border: "1px solid rgba(232,227,216,0.08)", borderRadius: "8px", padding: "14px" }}>
              <p style={{ fontSize: "12px", color: "rgba(232,227,216,0.4)", margin: 0, lineHeight: 1.6 }}>
                {detailT("memo.chatSummaryEmpty")}
              </p>
            </div>
          </div>
        )}

        {/* Tab: 映画情報 */}
        {activeTab === "info" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Staff chips */}
            <div>
              <p style={{ fontSize: "11px", letterSpacing: "0.08em", color: "rgba(232,227,216,0.45)", marginBottom: "10px" }}>{detailT("staff")}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {directorCredits.map((credit) => (
                  <PersonChip key={`dir-${credit.personId ?? credit.name}`} {...credit} />
                ))}
                {writerCredits.map((credit) => (
                  <PersonChip key={`writer-${credit.personId ?? credit.name}`} {...credit} compact />
                ))}
                {castCredits.slice(0, 5).map((credit) => (
                  <PersonChip key={`cast-${credit.personId ?? credit.name}`} {...credit} compact />
                ))}
              </div>
            </div>

            {/* Overview */}
            {overview && (
              <div>
                <p style={{ fontSize: "11px", letterSpacing: "0.08em", color: "rgba(232,227,216,0.45)", marginBottom: "8px" }}>{detailT("overview")}</p>
                <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgba(232,227,216,0.8)", margin: 0 }}>{overview}</p>
              </div>
            )}

            {/* Mood profile */}
            <div>
              <p style={{ fontSize: "11px", letterSpacing: "0.08em", color: "rgba(232,227,216,0.45)", marginBottom: "10px" }}>{detailT("moodProfile")}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {moodProfile.map(({ label, value }) => {
                  const pct = Math.round(value * 100);
                  return (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "10px", letterSpacing: "0.08em", color: "rgba(232,227,216,0.5)", width: "64px", textAlign: "right", flexShrink: 0 }}>{label}</span>
                      <div style={{ flex: 1, height: "4px", borderRadius: "999px", background: "rgba(232,227,216,0.1)" }}>
                        <div style={{ width: `${pct}%`, height: "100%", borderRadius: "999px", background: "linear-gradient(90deg, #E8C97A, #D4537E)" }} />
                      </div>
                      <span style={{ fontSize: "10px", color: "#E8C97A", width: "28px", flexShrink: 0 }}>{pct}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Similar films */}
            {similar.length > 0 && (
              <div>
                <p style={{ fontSize: "11px", letterSpacing: "0.08em", color: "rgba(232,227,216,0.45)", marginBottom: "10px" }}>{detailT("similarMovies")}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {similar.map((s) => (
                    <Link key={s.id} href={`/movies/${s.id}`} style={{ fontSize: "14px", color: "#e8e3d8", textDecoration: "none" }}>
                      {getMovieTitle(s, movieTitleLang)}
                      <span style={{ marginLeft: "8px", fontSize: "11px", color: "rgba(232,227,216,0.4)" }}>{s.releaseYear}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Review summary */}
            {reviewSummary && (
              <div>
                <p style={{ fontSize: "11px", letterSpacing: "0.08em", color: "rgba(232,227,216,0.45)", marginBottom: "8px" }}>{detailT("review")}</p>
                <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgba(232,227,216,0.7)", margin: 0 }}>{reviewSummary}</p>
              </div>
            )}
          </div>
        )}

        {/* Nav */}
        <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid rgba(232,227,216,0.08)", display: "flex", justifyContent: "center", gap: "32px" }}>
          <Link href="/browse" style={{ fontSize: "11px", letterSpacing: "0.1em", color: "rgba(232,227,216,0.4)", textDecoration: "none" }}>{detailT("backToBrowse")}</Link>
          <Link href="/recommend" style={{ fontSize: "11px", letterSpacing: "0.1em", color: "rgba(232,227,216,0.4)", textDecoration: "none" }}>{detailT("goToRecommend")}</Link>
        </div>
      </div>
    </div>
  );
}
