"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SwipeCard, type SwipeCardMovie } from "@/components/recommend/SwipeCard";
import { triggerMoviePicked } from "@/components/recommend/ConfettiEffect";

type MbtiCtx = {
  types: string[];
  score: number;
  decisionHook: string;
  chemistry: string;
} | null;

type Props = {
  movies: SwipeCardMovie[];
  sessionId: string;
};

export function SwipeResultClient({ movies, sessionId }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pickedMovie, setPickedMovie] = useState<SwipeCardMovie | null>(null);
  const [showDecision, setShowDecision] = useState(false);
  const [mbtiCtx, setMbtiCtx] = useState<MbtiCtx>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("mbtiRecommendContext");
    if (!raw) return;
    try {
      const ctx = JSON.parse(raw) as MbtiCtx;
      setMbtiCtx(ctx);
    } catch { /* ignore */ }
  }, []);

  const handlePass = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const handlePick = useCallback((movie: SwipeCardMovie) => {
    setPickedMovie(movie);
    void triggerMoviePicked();
    setTimeout(() => setShowDecision(true), 500);
    sessionStorage.removeItem("mbtiRecommendContext");
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (pickedMovie || currentIndex >= movies.length) return;
      if (e.key === "ArrowRight") {
        const movie = movies[currentIndex];
        if (movie) handlePick(movie);
      } else if (e.key === "ArrowLeft") {
        handlePass();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentIndex, handlePass, handlePick, movies, pickedMovie]);

  const allPassed = !pickedMovie && currentIndex >= movies.length;

  // Decision screen
  if (pickedMovie) {
    return (
      <div
        style={{
          minHeight: "100vh", background: "#0e0e0f", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", padding: "24px 20px", gap: "24px",
          animation: showDecision ? "fadeIn 0.4s ease" : "none",
        }}
      >
        <style>{`@keyframes fadeIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}`}</style>
        {pickedMovie.posterUrl && (
          <div style={{
            width: "140px", height: "210px", borderRadius: "12px", overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            animation: showDecision ? "fadeIn 0.5s ease 0.1s both" : "none",
          }}>
            <img src={pickedMovie.posterUrl} alt={pickedMovie.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.14em", color: "#E8C97A", margin: "0 0 8px" }}>今夜の1本、決定！</p>
          <h1 style={{ fontFamily: "var(--font-dm-serif)", fontSize: "26px", color: "#e8e3d8", margin: 0, lineHeight: 1.2 }}>
            {pickedMovie.title}
          </h1>
          {pickedMovie.year && (
            <p style={{ fontSize: "13px", color: "rgba(232,227,216,0.4)", margin: "6px 0 0" }}>
              {pickedMovie.year}{pickedMovie.directors[0] ? ` · ${pickedMovie.directors[0]}` : ""}
            </p>
          )}
        </div>
        {showDecision && (
          <div
            style={{
              display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center",
              animation: "fadeIn 0.4s ease 0.2s both",
            }}
          >
            <Link
              href={`/movies/${pickedMovie.id}`}
              style={{
                padding: "12px 24px", borderRadius: "10px",
                background: "#E8C97A", color: "#080808", fontWeight: 600,
                fontSize: "14px", textDecoration: "none", letterSpacing: "0.04em",
              }}
            >
              詳細を見る
            </Link>
            <Link
              href="/recommend"
              style={{
                padding: "12px 24px", borderRadius: "10px",
                background: "rgba(232,227,216,0.06)", color: "rgba(232,227,216,0.6)",
                border: "1px solid rgba(232,227,216,0.12)",
                fontSize: "14px", textDecoration: "none", letterSpacing: "0.04em",
              }}
            >
              もう一度探す
            </Link>
          </div>
        )}
      </div>
    );
  }

  // All passed screen
  if (allPassed) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0e0e0f", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "20px", padding: "24px",
        textAlign: "center",
      }}>
        <p style={{ fontSize: "32px" }}>🎬</p>
        <h2 style={{ fontFamily: "var(--font-dm-serif)", fontSize: "22px", color: "#e8e3d8", margin: 0 }}>
          すべてパスしました
        </h2>
        <p style={{ fontSize: "14px", color: "rgba(232,227,216,0.45)", margin: 0 }}>
          条件を変えて別の映画を探しますか？
        </p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
          <Link
            href="/recommend"
            style={{
              padding: "12px 24px", borderRadius: "10px",
              background: "#E8C97A", color: "#080808", fontWeight: 600,
              fontSize: "14px", textDecoration: "none", letterSpacing: "0.04em",
            }}
          >
            再度探す
          </Link>
          <Link
            href="/"
            style={{
              padding: "12px 24px", borderRadius: "10px",
              background: "rgba(232,227,216,0.06)", color: "rgba(232,227,216,0.55)",
              border: "1px solid rgba(232,227,216,0.12)",
              fontSize: "14px", textDecoration: "none",
            }}
          >
            ホームへ
          </Link>
        </div>
      </div>
    );
  }

  const remaining = movies.length - currentIndex;

  return (
    <div style={{ minHeight: "100vh", background: "#0e0e0f", display: "flex", flexDirection: "column", padding: "20px 16px 100px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div>
          <p style={{ fontSize: "11px", letterSpacing: "0.1em", color: "rgba(232,227,216,0.35)", margin: 0 }}>
            今夜の推薦 · {movies.length}本
          </p>
          {mbtiCtx && (
            <div style={{ display: "flex", gap: "4px", marginTop: "4px", flexWrap: "wrap" }}>
              {mbtiCtx.types.map((t, i) => (
                <span key={`${t}-${i}`} style={{
                  fontSize: "10px", fontWeight: 600, padding: "1px 6px", borderRadius: "999px",
                  background: "rgba(232,201,122,0.1)", color: "#E8C97A",
                  border: "1px solid rgba(232,201,122,0.25)", letterSpacing: "0.06em",
                }}>{t}</span>
              ))}
            </div>
          )}
        </div>
        <Link href="/recommend" style={{ fontSize: "12px", color: "rgba(232,227,216,0.35)", textDecoration: "none" }}>
          やり直す
        </Link>
      </div>

      {/* Dot progress */}
      <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginBottom: "12px" }}>
        {movies.map((_, i) => (
          <div key={i} style={{
            width: i === currentIndex ? "20px" : "6px",
            height: "6px", borderRadius: "999px",
            background: i === currentIndex
              ? "#E8C97A"
              : i < currentIndex
                ? "rgba(232,201,122,0.25)"
                : "rgba(232,227,216,0.12)",
            transition: "all 300ms ease",
          }} />
        ))}
      </div>

      {/* Hint */}
      <p style={{ textAlign: "center", fontSize: "11px", color: "rgba(232,227,216,0.25)", marginBottom: "16px", letterSpacing: "0.06em" }}>
        ← パス　　決定 →　　キーボード矢印キーも使えます
      </p>

      {/* Card stack */}
      <div style={{ position: "relative", flex: 1, minHeight: "480px", maxWidth: "440px", margin: "0 auto", width: "100%" }}>
        {movies.map((movie, i) => {
          if (i < currentIndex) return null;
          const depth = i - currentIndex;
          if (depth > 2) return null;
          const scale = 1 - depth * 0.04;
          const ty = depth * 10;
          return (
            <SwipeCard
              key={movie.id}
              movie={movie}
              decisionHook={mbtiCtx?.decisionHook}
              mbtiTypes={mbtiCtx?.types}
              isTop={i === currentIndex}
              onSwipeLeft={handlePass}
              onSwipeRight={() => handlePick(movie)}
              stackStyle={{
                zIndex: movies.length - i,
                transform: i === currentIndex ? undefined : `scale(${scale}) translateY(${ty}px)`,
                transformOrigin: "bottom center",
                transition: i === currentIndex ? undefined : "transform 300ms ease",
              }}
            />
          );
        })}
      </div>

      {/* Remaining count */}
      {remaining > 1 && (
        <p style={{ textAlign: "center", fontSize: "12px", color: "rgba(232,227,216,0.25)", marginTop: "16px" }}>
          あと {remaining - 1} 本
        </p>
      )}
    </div>
  );
}
