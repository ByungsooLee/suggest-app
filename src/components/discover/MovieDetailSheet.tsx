"use client";

import { useState } from "react";

type DiscoverMovie = {
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
};

type Props = {
  movie: DiscoverMovie;
  onClose: () => void;
  onAction: (action: "like" | "pass" | "watchlist") => void;
};

export function MovieDetailSheet({ movie, onClose, onAction }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 240);
  };

  const overview = movie.overview ?? "";
  const shortOverview = overview.slice(0, 120);
  const isLong = overview.length > 120;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed", inset: 0, zIndex: 40,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        }}
      />
      {/* Sheet */}
      <div
        className={closing ? "sheet closing" : "sheet"}
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
          background: "#111111", borderRadius: "20px 20px 0 0",
          borderTop: "1px solid rgba(232,227,216,0.08)",
          maxHeight: "85vh", overflowY: "auto",
          padding: "0 0 32px",
        }}
      >
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}>
          <div style={{ width: "36px", height: "4px", borderRadius: "999px", background: "rgba(232,227,216,0.15)" }} />
        </div>

        {/* Header */}
        <div style={{ display: "flex", gap: "14px", padding: "16px 20px" }}>
          {movie.posterUrl && (
            <div style={{ width: "64px", height: "96px", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
              <img src={movie.posterUrl} alt={movie.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
          <div>
            <h2 style={{ fontFamily: "var(--font-dm-serif)", fontSize: "20px", color: "#e8e3d8", margin: "0 0 4px", lineHeight: 1.2 }}>
              {movie.title}
            </h2>
            <p style={{ fontSize: "12px", color: "rgba(232,227,216,0.45)", margin: 0 }}>
              {[movie.year, movie.genrePrimary, movie.runtime ? `${movie.runtime}分` : null].filter(Boolean).join(" · ")}
            </p>
            {movie.reviewScore != null && (
              <p style={{ fontSize: "12px", color: "#E8C97A", margin: "4px 0 0" }}>★ {movie.reviewScore.toFixed(1)}</p>
            )}
          </div>
        </div>

        <div style={{ height: "1px", background: "rgba(232,227,216,0.06)", margin: "0 20px" }} />

        {/* Overview */}
        {overview && (
          <div style={{ padding: "14px 20px" }}>
            <p style={{ fontSize: "11px", letterSpacing: "0.08em", color: "rgba(232,227,216,0.35)", margin: "0 0 6px" }}>あらすじ</p>
            <p style={{ fontSize: "13px", color: "rgba(232,227,216,0.7)", lineHeight: 1.65, margin: 0 }}>
              {expanded ? overview : shortOverview}{!expanded && isLong ? "..." : ""}
            </p>
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                style={{ fontSize: "12px", color: "rgba(232,201,122,0.6)", background: "none", border: "none", cursor: "pointer", padding: "4px 0 0" }}
              >
                {expanded ? "折りたたむ" : "続きを読む"}
              </button>
            )}
          </div>
        )}

        {/* Directors */}
        {movie.directors.length > 0 && (
          <div style={{ padding: "0 20px 14px" }}>
            <p style={{ fontSize: "11px", letterSpacing: "0.08em", color: "rgba(232,227,216,0.35)", margin: "0 0 6px" }}>監督</p>
            {movie.directors.map((d) => (
              <p key={d} style={{ fontSize: "14px", color: "#e8e3d8", margin: 0 }}>{d}</p>
            ))}
          </div>
        )}

        {/* Cast */}
        {movie.cast.length > 0 && (
          <div style={{ padding: "0 20px 14px" }}>
            <p style={{ fontSize: "11px", letterSpacing: "0.08em", color: "rgba(232,227,216,0.35)", margin: "0 0 8px" }}>キャスト</p>
            <div style={{ display: "flex", gap: "8px", overflowX: "auto", scrollbarWidth: "none" }}>
              {movie.cast.slice(0, 8).map((name) => (
                <div key={name} style={{
                  flexShrink: 0, padding: "5px 10px", borderRadius: "999px",
                  background: "rgba(232,227,216,0.05)", border: "1px solid rgba(232,227,216,0.08)",
                  fontSize: "12px", color: "rgba(232,227,216,0.65)",
                }}>{name}</div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: "10px", padding: "8px 20px 0" }}>
          <button
            onClick={() => { onAction("pass"); handleClose(); }}
            style={{
              flex: 1, padding: "12px", borderRadius: "10px",
              background: "rgba(216,90,48,0.08)", border: "1px solid rgba(216,90,48,0.25)",
              color: "#D85A30", fontSize: "13px", fontWeight: 500, cursor: "pointer",
            }}
          >← パス</button>
          <button
            onClick={() => { onAction("watchlist"); handleClose(); }}
            style={{
              flex: 1, padding: "12px", borderRadius: "10px",
              background: "rgba(127,119,221,0.08)", border: "1px solid rgba(127,119,221,0.25)",
              color: "#7F77DD", fontSize: "13px", fontWeight: 500, cursor: "pointer",
            }}
          >★ 後で</button>
          <button
            onClick={() => { onAction("like"); handleClose(); }}
            style={{
              flex: 1, padding: "12px", borderRadius: "10px",
              background: "rgba(232,201,122,0.1)", border: "1px solid rgba(232,201,122,0.35)",
              color: "#E8C97A", fontSize: "13px", fontWeight: 600, cursor: "pointer",
            }}
          >興味あり →</button>
        </div>
      </div>
    </>
  );
}
