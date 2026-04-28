"use client";

import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";
import { useMovieTitleLang } from "@/lib/i18n/lang-context";
import { getMovieTitle } from "@/lib/movie-title";
import type { PersonChipData } from "@/components/person/types";

const GENRE_GRADIENTS: Record<string, string> = {
  スリラー:   "linear-gradient(160deg,#1a1020 0%,#2d1a3d 100%)",
  SF:         "linear-gradient(160deg,#0d1a2e 0%,#1a3a5c 100%)",
  ドラマ:     "linear-gradient(160deg,#1a0e0e 0%,#3d1a1a 100%)",
  ホラー:     "linear-gradient(160deg,#0a0e0a 0%,#0e2e0e 100%)",
  コメディ:   "linear-gradient(160deg,#1e1a0d 0%,#3d3510 100%)",
  アクション: "linear-gradient(160deg,#1a0a0a 0%,#3d1010 100%)",
  ロマンス:   "linear-gradient(160deg,#1a0d14 0%,#3d1a2d 100%)",
  アニメ:     "linear-gradient(160deg,#0d1a14 0%,#1a3d28 100%)",
  default:    "linear-gradient(160deg,#141418 0%,#2a2a30 100%)",
};

export type DiscoverMovie = {
  id: string;
  title: string;
  year: number;
  genrePrimary: string;
  directors: string[];
  posterUrl: string | null;
  runtime: number | null;
  reviewScore: number | null;
  overview: string | null;
  cast: string[];
  credits: PersonChipData[];
  localizedTitles?: unknown;
  localizedData?: unknown;
};

type Props = {
  movie: DiscoverMovie;
  isTop: boolean;
  stackStyle?: React.CSSProperties;
  onSwipe: (action: "like" | "pass" | "watchlist") => void;
  onTap: () => void;
};

const THRESHOLD = 80;

export function DiscoverSwipeCard({ movie, isTop, stackStyle, onSwipe, onTap }: Props) {
  const t = useTranslations("discover");
  const { lang } = useMovieTitleLang();
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [exiting, setExiting] = useState<"like" | "pass" | "watchlist" | null>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const fired = useRef(false);
  const moved = useRef(false);

  const stopButtonPointer = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
  };

  const exit = useCallback((action: "like" | "pass" | "watchlist") => {
    if (fired.current) return;
    fired.current = true;
    setExiting(action);
    setTimeout(() => onSwipe(action), 280);
  }, [onSwipe]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isTop || exiting) return;
    if (e.target instanceof HTMLElement && e.target.closest("button")) return;
    startX.current = e.clientX;
    startY.current = e.clientY;
    moved.current = false;
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !isTop || exiting) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) moved.current = true;
    setDragX(dx);
    setDragY(dy);
  };

  const handlePointerUp = () => {
    if (!isDragging || !isTop) return;
    setIsDragging(false);
    if (!moved.current) { setDragX(0); setDragY(0); return; }
    if (dragX > THRESHOLD) exit("like");
    else if (dragX < -THRESHOLD) exit("pass");
    else if (dragY < -THRESHOLD) exit("watchlist");
    else { setDragX(0); setDragY(0); }
  };

  const rotation = Math.max(-12, Math.min(12, dragX * 0.08));

  let overlayColor = "transparent";
  if (dragX > 20) overlayColor = `rgba(232,201,122,${Math.min(0.4, dragX / THRESHOLD * 0.4)})`;
  else if (dragX < -20) overlayColor = `rgba(216,90,48,${Math.min(0.4, -dragX / THRESHOLD * 0.4)})`;
  else if (dragY < -20) overlayColor = `rgba(127,119,221,${Math.min(0.4, -dragY / THRESHOLD * 0.4)})`;

  const cardTransform =
    exiting === "like"      ? "translateX(110vw) rotate(20deg)" :
    exiting === "pass"      ? "translateX(-110vw) rotate(-20deg)" :
    exiting === "watchlist" ? "translateY(-110vh) rotate(-5deg)" :
    isTop ? `translateX(${dragX}px) translateY(${dragY}px) rotate(${rotation}deg)` : "none";

  const transition = isDragging ? "none" : "transform 280ms cubic-bezier(0.16,1,0.3,1)";
  const bg = GENRE_GRADIENTS[movie.genrePrimary] ?? GENRE_GRADIENTS.default;
  const displayTitle = getMovieTitle(movie, lang);

  const showLike      = dragX > 30;
  const showPass      = dragX < -30;
  const showWatchlist = dragY < -30 && Math.abs(dragX) < 40;

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={(e) => {
        if (!isTop || exiting) return;
        if (e.target instanceof HTMLElement && e.target.closest("button")) return;
        onTap();
      }}
      style={{
        position: "absolute", inset: 0, borderRadius: "16px",
        background: "#141418", border: "1px solid rgba(255,255,255,0.07)",
        overflow: "hidden", display: "flex", flexDirection: "column",
        cursor: isTop ? (isDragging ? "grabbing" : "grab") : "default",
        userSelect: "none", touchAction: "none",
        transform: cardTransform, transition,
        willChange: "transform",
        ...stackStyle,
      }}
    >
      {/* Poster */}
      <div style={{ position: "relative", height: "320px", flexShrink: 0, overflow: "hidden" }}>
        {movie.posterUrl ? (
          <img src={movie.posterUrl} alt={displayTitle}
            style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none", display: "block" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: bg }} />
        )}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "100px",
          background: "linear-gradient(to bottom, transparent, #141418)", pointerEvents: "none",
        }} />
        {/* Overlay */}
        <div style={{ position: "absolute", inset: 0, background: overlayColor, pointerEvents: "none", transition: isDragging ? "none" : "background 150ms" }} />
        {/* Direction labels */}
        {showLike && (
          <div style={{ position: "absolute", top: "16px", left: "16px", padding: "4px 10px", borderRadius: "6px", border: "2px solid #E8C97A", color: "#E8C97A", fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em" }}>
            {t("hint.right").replace("→", "").trim()}
          </div>
        )}
        {showPass && (
          <div style={{ position: "absolute", top: "16px", right: "16px", padding: "4px 10px", borderRadius: "6px", border: "2px solid #D85A30", color: "#D85A30", fontSize: "13px", fontWeight: 700 }}>
            {t("hint.left").replace("←", "").trim()}
          </div>
        )}
        {showWatchlist && (
          <div style={{ position: "absolute", top: "16px", left: "50%", transform: "translateX(-50%)", padding: "4px 10px", borderRadius: "6px", border: "2px solid #7F77DD", color: "#7F77DD", fontSize: "13px", fontWeight: 700, whiteSpace: "nowrap" }}>
            {t("hint.up").replace("↑", "").trim()}
          </div>
        )}
        {/* Genre/year */}
        <div style={{ position: "absolute", bottom: "10px", left: "14px", fontSize: "11px", color: "rgba(232,227,216,0.5)", letterSpacing: "0.05em", pointerEvents: "none" }}>
          {[movie.genrePrimary, movie.year, movie.runtime ? `${movie.runtime}分` : null].filter(Boolean).join(" · ")}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
        <h2 style={{ fontFamily: "var(--font-dm-serif)", fontSize: "20px", margin: 0, color: "#e8e3d8", lineHeight: 1.2 }}>
          {displayTitle}
        </h2>
        <p style={{ fontSize: "12px", color: "rgba(232,227,216,0.4)", margin: 0 }}>
          {movie.directors.slice(0, 2).join(", ")}
          {movie.reviewScore != null ? ` · ★ ${movie.reviewScore.toFixed(1)}` : ""}
        </p>
        <p style={{ fontSize: "11px", color: "rgba(232,227,216,0.3)", margin: 0 }}>
          {t("tapHint")}
        </p>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "8px", padding: "0 14px 14px" }}>
        <button
          onPointerDown={stopButtonPointer}
          onPointerUp={stopButtonPointer}
          onClick={(e) => { e.stopPropagation(); if (isTop && !exiting) exit("pass"); }}
          style={{ flex: 1, height: "40px", borderRadius: "9px", background: "rgba(216,90,48,0.08)", border: "1px solid rgba(216,90,48,0.25)", color: "#D85A30", fontSize: "12px", cursor: "pointer" }}>
          {t("hint.left")}
        </button>
        <button
          onPointerDown={stopButtonPointer}
          onPointerUp={stopButtonPointer}
          onClick={(e) => { e.stopPropagation(); if (isTop && !exiting) exit("watchlist"); }}
          style={{ flex: 1, height: "40px", borderRadius: "9px", background: "rgba(127,119,221,0.08)", border: "1px solid rgba(127,119,221,0.25)", color: "#7F77DD", fontSize: "12px", cursor: "pointer" }}>
          {t("hint.up")}
        </button>
        <button
          onPointerDown={stopButtonPointer}
          onPointerUp={stopButtonPointer}
          onClick={(e) => { e.stopPropagation(); if (isTop && !exiting) exit("like"); }}
          style={{ flex: 1, height: "40px", borderRadius: "9px", background: "rgba(232,201,122,0.1)", border: "1px solid rgba(232,201,122,0.35)", color: "#E8C97A", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
          {t("hint.right")}
        </button>
      </div>
    </div>
  );
}
