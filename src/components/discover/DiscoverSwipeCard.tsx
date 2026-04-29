"use client";

import { useTranslations } from "next-intl";
import { useMovieTitleLang } from "@/lib/i18n/lang-context";
import type { MovieCardPayload } from "@/lib/movies/movie-card";
import { getMovieTitle } from "@/lib/movie-title";
import { getMovieCardGradient } from "@/components/swipe/card-styles";
import { useSwipeCardDrag } from "@/components/swipe/useSwipeCardDrag";

export type DiscoverMovie = MovieCardPayload;

type Props = {
  movie: DiscoverMovie;
  isTop: boolean;
  stackStyle?: React.CSSProperties;
  onSwipe: (action: "like" | "pass" | "watchlist") => void;
  onTap: () => void;
};

export function DiscoverSwipeCard({ movie, isTop, stackStyle, onSwipe, onTap }: Props) {
  const t = useTranslations("discover");
  const { lang } = useMovieTitleLang();
  const { dragX, dragY, isDragging, exiting, exit, stopButtonPointer, handlePointerDown, handlePointerMove, handlePointerUp } = useSwipeCardDrag({
    enabled: isTop,
    allowUpSwipe: true,
    onExit: (direction) => {
      if (direction === "right") onSwipe("like");
      else if (direction === "left") onSwipe("pass");
      else onSwipe("watchlist");
    },
  });

  const rotation = Math.max(-12, Math.min(12, dragX * 0.08));

  let overlayColor = "transparent";
  if (dragX > 20) overlayColor = `rgba(232,201,122,${Math.min(0.4, (dragX / 80) * 0.4)})`;
  else if (dragX < -20) overlayColor = `rgba(216,90,48,${Math.min(0.4, (-dragX / 80) * 0.4)})`;
  else if (dragY < -20) overlayColor = `rgba(127,119,221,${Math.min(0.4, (-dragY / 80) * 0.4)})`;

  const cardTransform =
    exiting === "right" ? "translateX(110vw) rotate(20deg)" :
    exiting === "left" ? "translateX(-110vw) rotate(-20deg)" :
    exiting === "up" ? "translateY(-110vh) rotate(-5deg)" :
    isTop ? `translateX(${dragX}px) translateY(${dragY}px) rotate(${rotation}deg)` : "none";

  const transition = isDragging ? "none" : "transform 280ms cubic-bezier(0.16,1,0.3,1)";
  const bg = getMovieCardGradient(movie.genrePrimary);
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
          {[movie.genrePrimary, movie.releaseYear, movie.runtimeMinutes ? `${movie.runtimeMinutes}分` : null].filter(Boolean).join(" · ")}
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
          onClick={(e) => { e.stopPropagation(); if (isTop && !exiting) exit("left"); }}
          style={{ flex: 1, height: "40px", borderRadius: "9px", background: "rgba(216,90,48,0.08)", border: "1px solid rgba(216,90,48,0.25)", color: "#D85A30", fontSize: "12px", cursor: "pointer" }}>
          {t("hint.left")}
        </button>
        <button
          onPointerDown={stopButtonPointer}
          onPointerUp={stopButtonPointer}
          onClick={(e) => { e.stopPropagation(); if (isTop && !exiting) exit("up"); }}
          style={{ flex: 1, height: "40px", borderRadius: "9px", background: "rgba(127,119,221,0.08)", border: "1px solid rgba(127,119,221,0.25)", color: "#7F77DD", fontSize: "12px", cursor: "pointer" }}>
          {t("hint.up")}
        </button>
        <button
          onPointerDown={stopButtonPointer}
          onPointerUp={stopButtonPointer}
          onClick={(e) => { e.stopPropagation(); if (isTop && !exiting) exit("right"); }}
          style={{ flex: 1, height: "40px", borderRadius: "9px", background: "rgba(232,201,122,0.1)", border: "1px solid rgba(232,201,122,0.35)", color: "#E8C97A", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
          {t("hint.right")}
        </button>
      </div>
    </div>
  );
}
