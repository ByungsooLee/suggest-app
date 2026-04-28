"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { DiscoverSwipeCard, type DiscoverMovie } from "@/components/discover/DiscoverSwipeCard";
import { MovieDetailSheet } from "@/components/discover/MovieDetailSheet";
import { ReasonTagPicker } from "@/components/discover/ReasonTagPicker";
import { DiscoverProgress } from "@/components/discover/DiscoverProgress";

type Props = {
  swipedMovieIds: string[];
  totalSwipes: number;
  personalityLabel: string | null;
};

type PendingAction = {
  movieId: string;
  action: "like" | "watchlist";
};

const BATCH_SIZE = 10;

export function DiscoverClient({ swipedMovieIds: initialSwiped, totalSwipes: initialTotal, personalityLabel: initialLabel }: Props) {
  const t = useTranslations("discover");
  const [movies, setMovies] = useState<DiscoverMovie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalSwipes, setTotalSwipes] = useState(initialTotal);
  const [personalityLabel, setPersonalityLabel] = useState(initialLabel);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [detailMovie, setDetailMovie] = useState<DiscoverMovie | null>(null);
  const [milestone100, setMilestone100] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const swipedIdsRef = useRef<Set<string>>(new Set(initialSwiped));
  const fetchingRef = useRef(false);

  const fetchMovies = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const exclude = [...swipedIdsRef.current].join(",");
      const res = await fetch(`/api/discover/movies?limit=${BATCH_SIZE}&exclude=${exclude}`);
      if (!res.ok) throw new Error("fetch failed");
      const data: DiscoverMovie[] = await res.json();
      setMovies((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        return [...prev, ...data.filter((m) => !existingIds.has(m.id))];
      });
    } catch {
      setError(t("fetchError"));
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // prefetch when near end
  useEffect(() => {
    if (movies.length > 0 && currentIndex >= movies.length - 3) {
      fetchMovies();
    }
  }, [currentIndex, movies.length, fetchMovies]);

  const submitSwipe = async (movieId: string, action: "like" | "pass" | "watchlist", reasons: string[]) => {
    try {
      const res = await fetch("/api/discover/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId, action, reasons }),
      });
      if (!res.ok) return;
      const data = await res.json();
      const newTotal = totalSwipes + 1;
      setTotalSwipes(newTotal);
      if (data.personalityLabel) {
        setPersonalityLabel(data.personalityLabel);
        setMilestone100(true);
      }
    } catch {
      // silent — swipe data is best-effort
    }
  };

  const handleSwipe = (action: "like" | "pass" | "watchlist") => {
    const movie = movies[currentIndex];
    if (!movie) return;
    swipedIdsRef.current.add(movie.id);
    if (action === "pass") {
      submitSwipe(movie.id, "pass", []);
    } else {
      setPendingAction({ movieId: movie.id, action });
    }
    setCurrentIndex((i) => i + 1);
  };

  const triggerSwipe = (action: "like" | "pass" | "watchlist") => {
    const movie = movies[currentIndex];
    if (!movie) return;
    handleSwipe(action);
  };

  // keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (pendingAction || detailMovie) return;
      if (e.key === "ArrowRight") triggerSwipe("like");
      else if (e.key === "ArrowLeft") triggerSwipe("pass");
      else if (e.key === "ArrowUp") triggerSwipe("watchlist");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const handleReasonConfirm = (reasons: string[]) => {
    if (!pendingAction) return;
    submitSwipe(pendingAction.movieId, pendingAction.action, reasons);
    setPendingAction(null);
  };

  const handleReasonSkip = () => {
    if (!pendingAction) return;
    submitSwipe(pendingAction.movieId, pendingAction.action, []);
    setPendingAction(null);
  };

  const visibleCards = movies.slice(currentIndex, currentIndex + 3);

  if (loading && movies.length === 0) {
    return (
      <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0e0e0f" }}>
        <p style={{ fontSize: "13px", color: "rgba(232,227,216,0.4)" }}>{t("loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0e0e0f" }}>
        <p style={{ fontSize: "13px", color: "rgba(216,90,48,0.7)" }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100svh", background: "#0e0e0f", display: "flex", flexDirection: "column", maxWidth: "430px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ padding: "56px 20px 16px" }}>
        <p style={{ fontSize: "11px", letterSpacing: "0.1em", color: "rgba(232,227,216,0.35)", margin: "0 0 4px" }}>DISCOVER</p>
        <DiscoverProgress totalSwipes={totalSwipes} personalityLabel={personalityLabel} />
      </div>

      {/* Card stack */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 16px" }}>
        {pendingAction ? (
          <ReasonTagPicker onConfirm={handleReasonConfirm} onSkip={handleReasonSkip} />
        ) : visibleCards.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ fontSize: "16px", color: "rgba(232,227,216,0.6)", marginBottom: "8px" }}>{t("deckDoneTitle")}</p>
            <p style={{ fontSize: "13px", color: "rgba(232,227,216,0.35)" }}>{t("deckDoneBody")}</p>
          </div>
        ) : (
          <div style={{ position: "relative", height: "520px" }}>
            {[...visibleCards].reverse().map((movie, revIdx) => {
              const idx = visibleCards.length - 1 - revIdx;
              const isTop = idx === 0;
              const stackStyle: React.CSSProperties = isTop ? {} : {
                transform: `scale(${1 - idx * 0.03}) translateY(${idx * 12}px)`,
                opacity: 1 - idx * 0.15,
                zIndex: -idx,
              };
              return (
                <DiscoverSwipeCard
                  key={movie.id}
                  movie={movie}
                  isTop={isTop}
                  stackStyle={stackStyle}
                  onSwipe={handleSwipe}
                  onTap={() => setDetailMovie(movie)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Swipe hints */}
      {!pendingAction && visibleCards.length > 0 && (
        <div style={{ padding: "12px 20px 32px", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: "11px", color: "rgba(232,227,216,0.2)" }}>{t("hint.left")}</span>
          <span style={{ fontSize: "11px", color: "rgba(232,227,216,0.2)" }}>{t("hint.up")}</span>
          <span style={{ fontSize: "11px", color: "rgba(232,227,216,0.2)" }}>{t("hint.right")}</span>
        </div>
      )}

      {/* Detail sheet */}
      {detailMovie && (
        <MovieDetailSheet
          movie={detailMovie}
          onClose={() => setDetailMovie(null)}
          onAction={(action) => {
            setDetailMovie(null);
            handleSwipe(action);
          }}
        />
      )}

      {/* 100-swipe milestone modal */}
      {milestone100 && (
        <>
          <div
            onClick={() => setMilestone100(false)}
            style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
          />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            zIndex: 70, background: "#141418", border: "1px solid rgba(232,201,122,0.2)",
            borderRadius: "20px", padding: "32px 24px", textAlign: "center", maxWidth: "320px", width: "90%",
          }}>
            <p style={{ fontSize: "28px", marginBottom: "12px" }}>✦</p>
            <p style={{ fontSize: "16px", fontWeight: 600, color: "#E8C97A", marginBottom: "8px" }}>{t("milestone.100")}</p>
            {personalityLabel && (
              <p style={{ fontSize: "20px", color: "#e8e3d8", marginBottom: "16px", fontFamily: "var(--font-dm-serif)" }}>
                {personalityLabel}
              </p>
            )}
            <p style={{ fontSize: "13px", color: "rgba(232,227,216,0.5)", marginBottom: "24px" }}>
              {t("deckDoneBody")}
            </p>
            <button
              onClick={() => setMilestone100(false)}
              style={{ padding: "12px 32px", borderRadius: "10px", background: "rgba(232,201,122,0.12)", border: "1px solid rgba(232,201,122,0.35)", color: "#E8C97A", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
            >
              {t("continue")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
