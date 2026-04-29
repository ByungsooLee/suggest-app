"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useState, useCallback, useRef, useEffect } from "react";
import type { PersonChipData } from "@/components/person/types";
import { useMovieTitleLang } from "@/lib/i18n/lang-context";
import { resolveField, type LocalizedData } from "@/lib/i18n/localized-movie";
import { getMovieTitle } from "@/lib/movie-title";
import { LangSelector } from "@/components/lang-selector";
import { generateMoviePrompt, type PromptType } from "@/lib/prompts/movie-prompt-generator";
import { useDominantColor } from "@/hooks/useDominantColor";
import {
  MovieDetailEmotionBar,
  MovieDetailFooterLinks,
  MovieDetailHero,
  MovieDetailInfoTab,
  MovieDetailMemoTab,
  MovieDetailPromptTab,
  MovieDetailTabNav,
} from "./movie-detail-sections";

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
        <MovieDetailHero
          title={title}
          posterUrl={posterUrl}
          genreLabels={[genrePrimary, genreSecondary].filter((value): value is string => Boolean(value)).map((genre) => (
            browseT.has(`genres.${genre}`) ? browseT(`genres.${genre}`) : genre
          ))}
          runtimeLabel={detailT("runtime", { min: runtimeMinutes })}
          firstDirector={directors[0]}
          reviewScore={reviewScore}
          watchedOnLabel={
            watchLog?.watchedAt
              ? detailT("watchedOn", {
                  date: new Date(watchLog.watchedAt).toLocaleDateString(uiLang === "ja" ? "ja-JP" : uiLang === "ko" ? "ko-KR" : "en-US"),
                })
              : null
          }
        />

        <MovieDetailEmotionBar
          items={EMOTION_CONFIG.map((item) => ({ key: item.key, color: item.color, title: item.label }))}
          emotion={emotion}
          onEmotionChange={handleEmotion}
          activeEmotionLabel={activeEmotion ? detailT(`emotion.${activeEmotion.key}`) : null}
          noWatchLogLabel={detailT("noWatchLog")}
          showNoWatchLog={!watchLog}
        />

        <MovieDetailTabNav
          activeTab={activeTab}
          onChange={setActiveTab}
          labels={{
            prompt: detailT("tabs.prompt"),
            memo: detailT("tabs.memo"),
            info: detailT("tabs.info"),
          }}
        />

        {/* Tab: プロンプト */}
        {activeTab === "prompt" && (
          <MovieDetailPromptTab
            promptCards={PROMPT_CARDS}
            selectedPrompt={selectedPrompt}
            onSelectPrompt={setSelectedPrompt}
            promptTypeLabel={(type) => detailT(`promptTypes.${type}`)}
            promptFreeLabel={detailT("promptFree")}
            promptText={promptText}
            promptUpgradeLabel={detailT("promptUpgrade", { count: 3 })}
            copied={copied}
            onCopy={handleCopy}
            promptCopyLabel={detailT("promptCopy")}
            promptCopiedLabel={detailT("promptCopied")}
            promptNoteLabel={detailT("promptNote")}
          />
        )}

        {/* Tab: メモ */}
        {activeTab === "memo" && (
          <MovieDetailMemoTab
            memoLabel={detailT("memo.label")}
            memo={memo}
            onChangeMemo={handleMemo}
            memoPlaceholder={detailT("memo.placeholder")}
            chatSummaryEmptyLabel={detailT("memo.chatSummaryEmpty")}
          />
        )}

        {/* Tab: 映画情報 */}
        {activeTab === "info" && (
          <MovieDetailInfoTab
            staffLabel={detailT("staff")}
            directorCredits={directorCredits}
            writerCredits={writerCredits}
            castCredits={castCredits}
            overviewLabel={detailT("overview")}
            overview={overview}
            moodProfileLabel={detailT("moodProfile")}
            moodProfile={moodProfile}
            similarMoviesLabel={detailT("similarMovies")}
            similar={similar}
            movieTitleLang={movieTitleLang}
            reviewLabel={detailT("review")}
            reviewSummary={reviewSummary}
          />
        )}

        <MovieDetailFooterLinks backToBrowseLabel={detailT("backToBrowse")} goToRecommendLabel={detailT("goToRecommend")} />
      </div>
    </div>
  );
}
