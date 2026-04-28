"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { PersonChip } from "@/components/person/PersonChip";
import { useMovieTitleLang } from "@/lib/i18n/lang-context";
import { getMovieTitle } from "@/lib/movie-title";
import { type SwipeCardMovie } from "@/components/recommend/SwipeCard";

type MbtiCtx = {
  types: string[];
  score: number;
  decisionHook: string;
  chemistry: string;
} | null;

type Props = {
  movies: SwipeCardMovie[];
};

export function SwipeResultClient({ movies }: Props) {
  const t = useTranslations("recommend");
  const { lang } = useMovieTitleLang();
  const [mbtiCtx, setMbtiCtx] = useState<MbtiCtx>(null);
  const [pickedId, setPickedId] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("mbtiRecommendContext");
    if (!raw) return;
    const timer = window.setTimeout(() => {
      try {
        setMbtiCtx(JSON.parse(raw) as MbtiCtx);
      } catch {
        // ignore invalid cached payload
      }
    }, 0);
    sessionStorage.removeItem("mbtiRecommendContext");
    return () => window.clearTimeout(timer);
  }, []);

  const [topPick, ...backups] = movies;
  if (!topPick) return null;
  const topPickTitle = getMovieTitle(topPick, lang);
  const topPickDirectors = (topPick.credits ?? []).filter((credit) => credit.role === "director");
  const retryLabel = t("retry");
  const retryParts = retryLabel.includes("→")
    ? retryLabel.split("→").map((part) => part.trim()).filter(Boolean)
    : [retryLabel];
  const retryLead = retryParts.length > 1 ? retryParts[0] : "";
  const retryAction = retryParts.length > 1 ? retryParts[retryParts.length - 1] : retryLabel;

  const isPicked = pickedId !== null;
  const pickedMovie = movies.find((m) => m.id === pickedId);
  const pickedMovieTitle = pickedMovie ? getMovieTitle(pickedMovie, lang) : null;

  if (isPicked && pickedMovie) {
    return (
      <div style={{
        minHeight: "100vh", background: "#080808", display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "32px 20px", gap: "24px",
        animation: "fadeIn 0.4s ease both",
      }}>
        <style>{`@keyframes fadeIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}`}</style>
        {pickedMovie.posterUrl && (
          <div style={{ width: "140px", height: "210px", borderRadius: "12px", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
            <img src={pickedMovie.posterUrl} alt={pickedMovieTitle ?? pickedMovie.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.14em", color: "#E8C97A", margin: "0 0 8px" }}>{t("decided")}</p>
          <h1 style={{ fontFamily: "var(--font-dm-serif)", fontSize: "26px", color: "#e8e3d8", margin: 0, lineHeight: 1.2 }}>
            {pickedMovieTitle}
          </h1>
          {pickedMovie.year && (
            <p style={{ fontSize: "13px", color: "rgba(232,227,216,0.4)", margin: "6px 0 0" }}>
              {pickedMovie.year}{pickedMovie.directors[0] ? ` · ${pickedMovie.directors[0]}` : ""}
            </p>
          )}
          {((pickedMovie.credits ?? []).filter((credit) => credit.role === "director").length > 0) && (
            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
              {(pickedMovie.credits ?? [])
                .filter((credit) => credit.role === "director")
                .slice(0, 2)
                .map((credit) => (
                  <PersonChip key={`picked-${credit.personId ?? credit.name}`} {...credit} />
                ))}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
          <Link href={`/movies/${pickedMovie.id}`} style={{
            padding: "12px 24px", borderRadius: "10px",
            background: "#E8C97A", color: "#080808",
            fontWeight: 600, fontSize: "14px", textDecoration: "none", letterSpacing: "0.04em",
          }}>{t("details")}</Link>
          <Link href="/recommend" style={{
            padding: "12px 24px", borderRadius: "10px",
            background: "rgba(232,227,216,0.06)", color: "rgba(232,227,216,0.6)",
            border: "1px solid rgba(232,227,216,0.12)",
            fontSize: "14px", textDecoration: "none",
          }}>{retryAction}</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#080808", padding: "20px 16px 100px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", maxWidth: "560px", margin: "0 auto 20px" }}>
        <div>
          <p style={{ fontSize: "11px", letterSpacing: "0.12em", color: "rgba(232,227,216,0.35)", margin: 0 }}>{t("title")}</p>
          {mbtiCtx && (
            <div style={{ display: "flex", gap: "4px", marginTop: "5px" }}>
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
          {t("retry").replace("気分が変わったら → ", "").replace("Changed your mind? → ", "").replace("기분이 바뀌었나요? → ", "")}
        </Link>
      </div>

      <div style={{ maxWidth: "560px", margin: "0 auto" }}>
        {/* Top pick — big card */}
        <div style={{
          borderRadius: "16px", overflow: "hidden",
          background: "#141418", border: "1px solid rgba(255,255,255,0.07)",
          marginBottom: "16px",
        }}>
          {topPick.posterUrl && (
            <div style={{ position: "relative", height: "260px" }}>
              <img src={topPick.posterUrl} alt={topPickTitle}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: "100px",
                background: "linear-gradient(to bottom, transparent, #141418)",
              }} />
              <div style={{
                position: "absolute", top: "12px", left: "12px",
                padding: "3px 8px", borderRadius: "6px",
                background: "rgba(232,201,122,0.9)", color: "#080808",
                fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em",
              }}>{t("topPick")}</div>
            </div>
          )}
          <div style={{ padding: "16px" }}>
            <h2 style={{ fontFamily: "var(--font-dm-serif)", fontSize: "22px", margin: "0 0 5px", color: "#e8e3d8", lineHeight: 1.2 }}>
              {topPickTitle}
            </h2>
            <p style={{ fontSize: "12px", color: "rgba(232,227,216,0.45)", margin: "0 0 12px" }}>
              {[topPick.directors[0], topPick.year, topPick.genre, topPick.duration ? `${topPick.duration}分` : null].filter(Boolean).join(" · ")}
            </p>
            {topPickDirectors.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "14px" }}>
                {topPickDirectors.slice(0, 2).map((credit) => (
                  <PersonChip key={`top-${credit.personId ?? credit.name}`} {...credit} />
                ))}
              </div>
            )}
            {mbtiCtx?.decisionHook && (
              <div style={{
                background: "rgba(232,201,122,0.05)", border: "1px solid rgba(232,201,122,0.15)",
                borderRadius: "8px", padding: "10px 12px", marginBottom: "14px",
              }}>
                <p style={{ fontSize: "12px", color: "rgba(232,227,216,0.7)", margin: 0, lineHeight: 1.6 }}>
                  {mbtiCtx.decisionHook}
                </p>
              </div>
            )}
            <button
              onClick={() => setPickedId(topPick.id)}
              className="pulse-gold btn-bounce"
              style={{
                width: "100%", padding: "13px", borderRadius: "10px",
                background: "#E8C97A", color: "#080808",
                fontWeight: 700, fontSize: "14px", letterSpacing: "0.04em",
                border: "none", cursor: "pointer",
              }}
            >
              {t("pickThis")}
            </button>
          </div>
        </div>

        {/* Backups — 2 small cards */}
        {backups.length > 0 && (
          <>
            <p style={{ fontSize: "11px", letterSpacing: "0.1em", color: "rgba(232,227,216,0.3)", marginBottom: "10px" }}>
              {t("backup")}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
              {backups.slice(0, 2).map((movie) => {
                const movieTitle = getMovieTitle(movie, lang);
                return (
                <div
                  key={movie.id}
                  style={{
                    borderRadius: "12px", overflow: "hidden",
                    background: "#141418", border: "1px solid rgba(255,255,255,0.06)",
                    cursor: "pointer",
                  }}
                  onClick={() => setPickedId(movie.id)}
                >
                  <div style={{ position: "relative", height: "130px" }}>
                    {movie.posterUrl ? (
                      <img src={movie.posterUrl} alt={movieTitle}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "#1a1a1a" }} />
                    )}
                    <div style={{
                      position: "absolute", bottom: 0, left: 0, right: 0, height: "60px",
                      background: "linear-gradient(to bottom, transparent, #141418)",
                    }} />
                  </div>
                  <div style={{ padding: "10px 12px" }}>
                    <p style={{ fontSize: "13px", color: "#e8e3d8", margin: "0 0 3px", lineHeight: 1.3 }}>
                      {movieTitle}
                    </p>
                    <p style={{ fontSize: "11px", color: "rgba(232,227,216,0.4)", margin: 0 }}>
                      {movie.genre ?? ""}{movie.year ? ` · ${movie.year}` : ""}
                    </p>
                    {((movie.credits ?? []).filter((credit) => credit.role === "director").length > 0) && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                        {(movie.credits ?? [])
                          .filter((credit) => credit.role === "director")
                          .slice(0, 1)
                          .map((credit) => (
                            <PersonChip key={`backup-${credit.personId ?? credit.name}`} {...credit} compact />
                          ))}
                      </div>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); setPickedId(movie.id); }}
                      style={{
                        marginTop: "8px", width: "100%", padding: "7px",
                        borderRadius: "7px", background: "rgba(232,201,122,0.1)",
                        border: "1px solid rgba(232,201,122,0.25)",
                        color: "#E8C97A", fontSize: "11px", fontWeight: 500,
                        cursor: "pointer", letterSpacing: "0.04em",
                      }}
                    >{t("pickThisShort")}</button>
                  </div>
                </div>
                );
              })}
            </div>
          </>
        )}

        <p style={{ textAlign: "center", fontSize: "13px", color: "rgba(232,227,216,0.3)" }}>
          {retryLead ? `${retryLead} → ` : ""}
          <Link href="/recommend" style={{ color: "rgba(232,201,122,0.6)", textDecoration: "none" }}>
            {retryAction}
          </Link>
        </p>
      </div>
    </div>
  );
}
