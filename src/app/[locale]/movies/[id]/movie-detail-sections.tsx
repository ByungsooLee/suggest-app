"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";

import { PersonChip } from "@/components/person/PersonChip";
import type { PersonChipData } from "@/components/person/types";
import { getMovieTitle } from "@/lib/movie-title";
import type { PromptType } from "@/lib/prompts/movie-prompt-generator";

type MoodEntry = { label: string; value: number };

type SimilarMovie = {
  id: string;
  title: string;
  releaseYear: number;
  localizedTitles?: unknown;
  localizedData?: unknown;
};

export function MovieDetailHero({
  title,
  posterUrl,
  genreLabels,
  runtimeLabel,
  firstDirector,
  reviewScore,
  watchedOnLabel,
}: {
  title: string;
  posterUrl: string | null;
  genreLabels: string[];
  runtimeLabel: string;
  firstDirector?: string;
  reviewScore: number | null;
  watchedOnLabel?: string | null;
}) {
  return (
    <div style={{ display: "flex", gap: "20px", marginBottom: "28px" }}>
      <div
        style={{
          flexShrink: 0,
          width: "120px",
          height: "180px",
          borderRadius: "8px",
          overflow: "hidden",
          background: "rgba(232,227,216,0.06)",
          position: "relative",
        }}
      >
        {posterUrl ? (
          <Image src={posterUrl} alt={title} fill className="object-cover" />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "2rem", opacity: 0.2 }}>
            {title[0]}
          </div>
        )}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "8px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {genreLabels.map((label) => (
            <span
              key={label}
              style={{
                fontSize: "10px",
                letterSpacing: "0.1em",
                padding: "2px 8px",
                border: "1px solid rgba(232,227,216,0.2)",
                borderRadius: "999px",
                color: "rgba(232,227,216,0.6)",
              }}
            >
              {label}
            </span>
          ))}
          <span
            style={{
              fontSize: "10px",
              letterSpacing: "0.1em",
              padding: "2px 8px",
              border: "1px solid rgba(232,227,216,0.2)",
              borderRadius: "999px",
              color: "rgba(232,227,216,0.6)",
            }}
          >
            {runtimeLabel}
          </span>
        </div>
        <h1 style={{ fontFamily: "var(--font-dm-serif)", fontSize: "22px", lineHeight: 1.2, margin: 0 }}>{title}</h1>
        {firstDirector && <p style={{ fontSize: "12px", color: "rgba(232,227,216,0.55)", margin: 0 }}>{firstDirector}</p>}
        {reviewScore != null && (
          <p style={{ fontFamily: "var(--font-dm-serif)", fontSize: "28px", color: "#E8C97A", margin: 0, lineHeight: 1 }}>
            {reviewScore.toFixed(1)}
            <span style={{ fontSize: "12px", color: "rgba(232,227,216,0.45)", marginLeft: "4px" }}>/10</span>
          </p>
        )}
        {watchedOnLabel && <p style={{ fontSize: "11px", color: "rgba(232,227,216,0.35)", margin: 0 }}>{watchedOnLabel}</p>}
      </div>
    </div>
  );
}

export function MovieDetailEmotionBar({
  items,
  emotion,
  onEmotionChange,
  activeEmotionLabel,
  noWatchLogLabel,
  showNoWatchLog,
}: {
  items: Array<{ key: string; color: string; title: string }>;
  emotion: string | null;
  onEmotionChange: (key: string) => void;
  activeEmotionLabel?: string | null;
  noWatchLogLabel: string;
  showNoWatchLog: boolean;
}) {
  return (
    <div style={{ marginBottom: "28px" }}>
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => onEmotionChange(item.key)}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: item.color,
              border: emotion === item.key ? "2px solid #fff" : "2px solid transparent",
              cursor: "pointer",
              flexShrink: 0,
              transform: emotion === item.key ? "scale(1.15)" : "scale(1)",
              transition: "all 0.15s",
            }}
            title={item.title}
          />
        ))}
        {activeEmotionLabel && <span style={{ fontSize: "12px", color: "rgba(232,227,216,0.65)", marginLeft: "4px" }}>{activeEmotionLabel}</span>}
      </div>
      {showNoWatchLog && <p style={{ fontSize: "12px", color: "rgba(232,227,216,0.35)", marginTop: "10px" }}>{noWatchLogLabel}</p>}
    </div>
  );
}

export function MovieDetailTabNav({
  activeTab,
  onChange,
  labels,
}: {
  activeTab: "prompt" | "memo" | "info";
  onChange: (tab: "prompt" | "memo" | "info") => void;
  labels: Record<"prompt" | "memo" | "info", string>;
}) {
  return (
    <div style={{ display: "flex", gap: "0", borderBottom: "1px solid rgba(232,227,216,0.12)", marginBottom: "24px" }}>
      {(["prompt", "memo", "info"] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          style={{
            padding: "8px 16px",
            fontSize: "12px",
            letterSpacing: "0.08em",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: activeTab === tab ? "#E8C97A" : "rgba(232,227,216,0.45)",
            borderBottom: activeTab === tab ? "2px solid #E8C97A" : "2px solid transparent",
            marginBottom: "-1px",
            transition: "color 0.15s",
          }}
        >
          {labels[tab]}
        </button>
      ))}
    </div>
  );
}

export function MovieDetailPromptTab({
  promptCards,
  selectedPrompt,
  onSelectPrompt,
  promptTypeLabel,
  promptFreeLabel,
  promptText,
  promptUpgradeLabel,
  copied,
  onCopy,
  promptCopyLabel,
  promptCopiedLabel,
  promptNoteLabel,
}: {
  promptCards: Array<{ type: PromptType; icon: string; premium: boolean }>;
  selectedPrompt: PromptType;
  onSelectPrompt: (type: PromptType) => void;
  promptTypeLabel: (type: PromptType) => string;
  promptFreeLabel: string;
  promptText: string;
  promptUpgradeLabel: string;
  copied: boolean;
  onCopy: () => void;
  promptCopyLabel: string;
  promptCopiedLabel: string;
  promptNoteLabel: string;
}) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
        {promptCards.map((card) => (
          <button
            key={card.type}
            onClick={() => !card.premium && onSelectPrompt(card.type)}
            style={{
              padding: "16px",
              borderRadius: "10px",
              textAlign: "left",
              cursor: card.premium ? "default" : "pointer",
              background: selectedPrompt === card.type && !card.premium ? "rgba(232,201,122,0.1)" : "rgba(232,227,216,0.04)",
              border: selectedPrompt === card.type && !card.premium ? "1px solid rgba(232,201,122,0.4)" : "1px solid rgba(232,227,216,0.1)",
              opacity: card.premium ? 0.5 : 1,
              transition: "all 0.15s",
              position: "relative",
            }}
          >
            {card.premium && <span style={{ position: "absolute", top: "8px", right: "8px", fontSize: "12px" }}>🔒</span>}
            <div style={{ fontSize: "20px", marginBottom: "6px" }}>{card.icon}</div>
            <div style={{ fontSize: "12px", letterSpacing: "0.05em", color: card.premium ? "rgba(232,227,216,0.5)" : "rgba(232,227,216,0.85)" }}>
              {promptTypeLabel(card.type)}
            </div>
            {!card.premium && <div style={{ fontSize: "10px", color: "rgba(232,201,122,0.7)", marginTop: "4px" }}>{promptFreeLabel}</div>}
          </button>
        ))}
      </div>

      <div style={{ background: "rgba(232,227,216,0.04)", border: "1px solid rgba(232,227,216,0.1)", borderRadius: "10px", padding: "16px", marginBottom: "12px" }}>
        <p style={{ fontFamily: "var(--font-dm-serif)", fontStyle: "italic", fontSize: "13px", lineHeight: 1.7, color: "rgba(232,227,216,0.8)", margin: 0 }}>
          {promptText}
        </p>
      </div>

      <p style={{ fontSize: "11px", color: "rgba(232,227,216,0.35)", textAlign: "center", marginBottom: "16px" }}>{promptUpgradeLabel}</p>

      <button
        onClick={onCopy}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "10px",
          border: "none",
          cursor: "pointer",
          background: copied ? "#5DCAA5" : "#E8C97A",
          color: "#080808",
          fontWeight: 600,
          fontSize: "14px",
          letterSpacing: "0.05em",
          transition: "background 0.2s",
        }}
      >
        {copied ? `${promptCopiedLabel} ✓` : promptCopyLabel}
      </button>

      <p style={{ fontSize: "12px", color: "rgba(232,227,216,0.35)", textAlign: "center", marginTop: "8px" }}>{promptNoteLabel}</p>
    </div>
  );
}

export function MovieDetailMemoTab({
  memoLabel,
  memo,
  onChangeMemo,
  memoPlaceholder,
  chatSummaryEmptyLabel,
}: {
  memoLabel: string;
  memo: string;
  onChangeMemo: (value: string) => void;
  memoPlaceholder: string;
  chatSummaryEmptyLabel: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <label style={{ fontSize: "11px", letterSpacing: "0.08em", color: "rgba(232,227,216,0.45)", display: "block", marginBottom: "8px" }}>
          {memoLabel}
        </label>
        <textarea
          value={memo}
          onChange={(event) => onChangeMemo(event.target.value)}
          rows={5}
          placeholder={memoPlaceholder}
          style={{
            width: "100%",
            background: "rgba(232,227,216,0.04)",
            border: "1px solid rgba(232,227,216,0.1)",
            borderRadius: "8px",
            padding: "12px",
            color: "#e8e3d8",
            fontSize: "14px",
            lineHeight: 1.6,
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ background: "rgba(232,227,216,0.03)", border: "1px solid rgba(232,227,216,0.08)", borderRadius: "8px", padding: "14px" }}>
        <p style={{ fontSize: "12px", color: "rgba(232,227,216,0.4)", margin: 0, lineHeight: 1.6 }}>{chatSummaryEmptyLabel}</p>
      </div>
    </div>
  );
}

export function MovieDetailInfoTab({
  staffLabel,
  directorCredits,
  writerCredits,
  castCredits,
  overviewLabel,
  overview,
  moodProfileLabel,
  moodProfile,
  similarMoviesLabel,
  similar,
  movieTitleLang,
  reviewLabel,
  reviewSummary,
}: {
  staffLabel: string;
  directorCredits: PersonChipData[];
  writerCredits: PersonChipData[];
  castCredits: PersonChipData[];
  overviewLabel: string;
  overview: string | null;
  moodProfileLabel: string;
  moodProfile: MoodEntry[];
  similarMoviesLabel: string;
  similar: SimilarMovie[];
  movieTitleLang: string;
  reviewLabel: string;
  reviewSummary: string | null;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <p style={{ fontSize: "11px", letterSpacing: "0.08em", color: "rgba(232,227,216,0.45)", marginBottom: "10px" }}>{staffLabel}</p>
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

      {overview && (
        <div>
          <p style={{ fontSize: "11px", letterSpacing: "0.08em", color: "rgba(232,227,216,0.45)", marginBottom: "8px" }}>{overviewLabel}</p>
          <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgba(232,227,216,0.8)", margin: 0 }}>{overview}</p>
        </div>
      )}

      <div>
        <p style={{ fontSize: "11px", letterSpacing: "0.08em", color: "rgba(232,227,216,0.45)", marginBottom: "10px" }}>{moodProfileLabel}</p>
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

      {similar.length > 0 && (
        <div>
          <p style={{ fontSize: "11px", letterSpacing: "0.08em", color: "rgba(232,227,216,0.45)", marginBottom: "10px" }}>{similarMoviesLabel}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {similar.map((item) => (
              <Link key={item.id} href={`/movies/${item.id}`} style={{ fontSize: "14px", color: "#e8e3d8", textDecoration: "none" }}>
                {getMovieTitle(item, movieTitleLang)}
                <span style={{ marginLeft: "8px", fontSize: "11px", color: "rgba(232,227,216,0.4)" }}>{item.releaseYear}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {reviewSummary && (
        <div>
          <p style={{ fontSize: "11px", letterSpacing: "0.08em", color: "rgba(232,227,216,0.45)", marginBottom: "8px" }}>{reviewLabel}</p>
          <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgba(232,227,216,0.7)", margin: 0 }}>{reviewSummary}</p>
        </div>
      )}
    </div>
  );
}

export function MovieDetailFooterLinks({
  backToBrowseLabel,
  goToRecommendLabel,
}: {
  backToBrowseLabel: string;
  goToRecommendLabel: string;
}) {
  return (
    <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid rgba(232,227,216,0.08)", display: "flex", justifyContent: "center", gap: "32px" }}>
      <Link href="/browse" style={{ fontSize: "11px", letterSpacing: "0.1em", color: "rgba(232,227,216,0.4)", textDecoration: "none" }}>
        {backToBrowseLabel}
      </Link>
      <Link href="/recommend" style={{ fontSize: "11px", letterSpacing: "0.1em", color: "rgba(232,227,216,0.4)", textDecoration: "none" }}>
        {goToRecommendLabel}
      </Link>
    </div>
  );
}
