"use client";

import { useCallback, useRef, useState } from "react";

const GENRE_GRADIENTS: Record<string, string> = {
  スリラー: "linear-gradient(135deg, #1a1020 0%, #2d1a3d 100%)",
  SF: "linear-gradient(135deg, #0d1a2e 0%, #1a3a5c 100%)",
  ドラマ: "linear-gradient(135deg, #1a0e0e 0%, #3d1a1a 100%)",
  ホラー: "linear-gradient(135deg, #0d1e14 0%, #1a3d28 100%)",
  コメディ: "linear-gradient(135deg, #1e1a0d 0%, #3d3510 100%)",
  default: "linear-gradient(135deg, #141418 0%, #2a2a30 100%)",
};

export type SwipeCardMovie = {
  id: string;
  title: string;
  year: number | null;
  genre: string | null;
  duration: number | null;
  directors: string[];
  score: number | null;
  posterUrl: string | null;
  overview: string | null;
};

type Props = {
  movie: SwipeCardMovie;
  decisionHook?: string;
  mbtiTypes?: string[];
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isTop: boolean;
  stackStyle?: React.CSSProperties;
};

const THRESHOLD = 80;

export function SwipeCard({ movie, decisionHook, mbtiTypes, onSwipeLeft, onSwipeRight, isTop, stackStyle }: Props) {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [exiting, setExiting] = useState<"left" | "right" | null>(null);
  const startX = useRef(0);
  const fired = useRef(false);

  const exit = useCallback(
    (dir: "left" | "right") => {
      if (fired.current) return;
      fired.current = true;
      setExiting(dir);
      setTimeout(() => {
        if (dir === "right") onSwipeRight();
        else onSwipeLeft();
      }, 280);
    },
    [onSwipeLeft, onSwipeRight],
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isTop || exiting) return;
    startX.current = e.clientX;
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !isTop || exiting) return;
    setDragX(e.clientX - startX.current);
  };

  const handlePointerUp = () => {
    if (!isDragging || !isTop) return;
    setIsDragging(false);
    if (dragX > THRESHOLD) exit("right");
    else if (dragX < -THRESHOLD) exit("left");
    else setDragX(0);
  };

  const rotation = Math.max(-12, Math.min(12, dragX * 0.1));
  const rightOverlay = dragX > 0 ? Math.min(0.35, (dragX / THRESHOLD) * 0.35) : 0;
  const leftOverlay = dragX < 0 ? Math.min(0.35, (-dragX / THRESHOLD) * 0.35) : 0;

  const cardTransform =
    exiting === "right"
      ? "translateX(110vw) rotate(20deg)"
      : exiting === "left"
        ? "translateX(-110vw) rotate(-20deg)"
        : isTop
          ? `translateX(${dragX}px) rotate(${rotation}deg)`
          : "none";

  const transition = isDragging ? "none" : "transform 280ms cubic-bezier(0.16, 1, 0.3, 1)";
  const posterBg = GENRE_GRADIENTS[movie.genre ?? ""] ?? GENRE_GRADIENTS.default;

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "16px",
        background: "#141418",
        border: "1px solid rgba(255,255,255,0.08)",
        overflow: "hidden",
        cursor: isTop ? (isDragging ? "grabbing" : "grab") : "default",
        userSelect: "none",
        touchAction: "none",
        transform: cardTransform,
        transition,
        willChange: "transform",
        display: "flex",
        flexDirection: "column",
        ...stackStyle,
      }}
    >
      {/* Poster */}
      <div style={{ position: "relative", height: "240px", flexShrink: 0, overflow: "hidden" }}>
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none", display: "block" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: posterBg }} />
        )}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "80px",
          background: "linear-gradient(to bottom, transparent, #141418)",
          pointerEvents: "none",
        }} />
        {/* Overlays */}
        <div style={{ position: "absolute", inset: 0, background: "#E8C97A", opacity: rightOverlay, pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, background: "#D85A30", opacity: leftOverlay, pointerEvents: "none" }} />
        {/* Labels */}
        {rightOverlay > 0.12 && (
          <div style={{
            position: "absolute", top: "14px", left: "14px",
            padding: "3px 10px", borderRadius: "6px",
            border: "2px solid #E8C97A", color: "#E8C97A",
            fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em",
          }}>決定</div>
        )}
        {leftOverlay > 0.12 && (
          <div style={{
            position: "absolute", top: "14px", right: "14px",
            padding: "3px 10px", borderRadius: "6px",
            border: "2px solid #D85A30", color: "#D85A30",
            fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em",
          }}>パス</div>
        )}
        {/* Genre · Year · Duration */}
        <div style={{
          position: "absolute", bottom: "10px", left: "14px",
          fontSize: "11px", color: "rgba(232,227,216,0.55)", letterSpacing: "0.05em",
          pointerEvents: "none",
        }}>
          {[movie.genre, movie.year, movie.duration ? `${movie.duration}分` : null].filter(Boolean).join(" · ")}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "14px 16px 10px", flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-dm-serif)", fontSize: "20px", margin: "0 0 4px", lineHeight: 1.2, color: "#e8e3d8" }}>
            {movie.title}
          </h2>
          <p style={{ fontSize: "12px", color: "rgba(232,227,216,0.4)", margin: 0 }}>
            {movie.directors.slice(0, 2).join(", ")}
            {movie.score != null && ` · ★ ${movie.score.toFixed(1)}`}
          </p>
        </div>

        {(mbtiTypes?.length ?? 0) > 0 || decisionHook ? (
          <div style={{
            background: "rgba(232,201,122,0.06)", border: "1px solid rgba(232,201,122,0.15)",
            borderRadius: "8px", padding: "10px 12px",
          }}>
            {(mbtiTypes?.length ?? 0) > 0 && (
              <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: decisionHook ? "6px" : 0 }}>
                {mbtiTypes!.map((t, i) => (
                  <span key={`${t}-${i}`} style={{
                    fontSize: "10px", fontWeight: 600, padding: "1px 7px",
                    borderRadius: "999px", background: "rgba(232,201,122,0.12)",
                    color: "#E8C97A", border: "1px solid rgba(232,201,122,0.25)",
                    letterSpacing: "0.06em",
                  }}>{t}</span>
                ))}
              </div>
            )}
            {decisionHook && (
              <p style={{ fontSize: "12px", color: "rgba(232,227,216,0.7)", margin: 0, lineHeight: 1.55 }}>
                {decisionHook}
              </p>
            )}
          </div>
        ) : null}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "10px", padding: "0 16px 16px" }}>
        <button
          onClick={(e) => { e.stopPropagation(); if (isTop && !exiting) exit("left"); }}
          style={{
            flex: 1, height: "44px", borderRadius: "10px",
            background: "rgba(216,90,48,0.08)", border: "1px solid rgba(216,90,48,0.3)",
            color: "#D85A30", fontSize: "13px", fontWeight: 500,
            cursor: "pointer", letterSpacing: "0.04em",
          }}
        >← パス</button>
        <button
          onClick={(e) => { e.stopPropagation(); if (isTop && !exiting) exit("right"); }}
          style={{
            flex: 1, height: "44px", borderRadius: "10px",
            background: "rgba(232,201,122,0.1)", border: "1px solid rgba(232,201,122,0.35)",
            color: "#E8C97A", fontSize: "13px", fontWeight: 600,
            cursor: "pointer", letterSpacing: "0.04em",
          }}
        >今夜これ！ →</button>
      </div>
    </div>
  );
}
