"use client";

import { Link } from "@/i18n/navigation";
import { useState, useEffect } from "react";
import { generateMoviePrompt } from "@/lib/prompts/movie-prompt-generator";

type MovieSnap = {
  id: string;
  title: string;
  genrePrimary: string;
  posterUrl: string | null;
  directors: string[];
  releaseYear: number;
};

type LogEntry = {
  id: string;
  movieId: string;
  watchedAt: string;
  score: number | null;
  emotion: string | null;
  memo: string | null;
  promptUsed: string | null;
  movie: MovieSnap;
};

type Stats = {
  totalCount: number;
  avgScore: number;
  topGenre: string;
  promptUsedCount: number;
  byGenre: { genre: string; count: number }[];
  byEmotion: { emotion: string; count: number }[];
  byMonth: { month: number; count: number }[];
  recentLog: LogEntry | null;
  logs: LogEntry[];
};

const GENRE_COLORS: Record<string, string> = {
  action: "#5C1A1A", adventure: "#1A3D29", animation: "#3D2E14",
  comedy: "#2A1A4A", crime: "#1A2030", drama: "#1A2D3D",
  family: "#1E3010", fantasy: "#2A1040", horror: "#100505",
  mystery: "#101520", musical: "#3D1A28", romance: "#3D1020",
  "sci-fi": "#071428", thriller: "#150820",
};

const EMOTION_COLORS: Record<string, string> = {
  excited: "#E8C97A", moved: "#D4537E", thinking: "#7F77DD",
  thrilled: "#D85A30", relaxed: "#5DCAA5",
};

const MONTH_LABELS = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR - 2, CURRENT_YEAR - 1, CURRENT_YEAR];

export function TechoClient() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [bannerCopied, setBannerCopied] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/techo/stats?year=${year}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error("stats fetch failed");
        return r.json() as Promise<Stats>;
      })
      .then(setStats)
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setStats(null);
        setError("映画手帳を読み込めませんでした");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [year, reloadKey]);

  const handleYearChange = (nextYear: number) => {
    if (nextYear === year) return;
    setStats(null);
    setError(null);
    setLoading(true);
    setYear(nextYear);
  };

  const handleReload = () => {
    setStats(null);
    setError(null);
    setLoading(true);
    setReloadKey((key) => key + 1);
  };

  const grouped: Record<string, LogEntry[]> = {};
  for (const log of stats?.logs ?? []) {
    const g = log.movie.genrePrimary;
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(log);
  }

  const maxGenreCount = Math.max(1, ...(stats?.byGenre.map((g) => g.count) ?? []));
  const maxMonthCount = Math.max(1, ...(stats?.byMonth.map((m) => m.count) ?? []));
  const currentMonth = new Date().getMonth() + 1;

  const recentMovie = stats?.recentLog?.movie;
  const bannerPrompt = recentMovie
    ? generateMoviePrompt(
        { title: recentMovie.title, releaseYear: recentMovie.releaseYear, directors: recentMovie.directors },
        "director",
      )
    : null;

  const handleBannerCopy = async () => {
    if (!bannerPrompt) return;
    await navigator.clipboard.writeText(bannerPrompt);
    setBannerCopied(true);
    setTimeout(() => setBannerCopied(false), 2000);
  };

  return (
    <div style={{ background: "#0e0e0f", minHeight: "100vh", color: "#e8e3d8", fontFamily: "var(--font-dm-sans)" }}>
      {/* Header */}
      <div style={{ padding: "20px 20px 0", maxWidth: "960px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "20px", marginBottom: "16px" }}>
          <h1 style={{ fontFamily: "var(--font-dm-serif)", fontSize: "28px", margin: 0 }}>映画手帳</h1>
          <div style={{ display: "flex", gap: "8px" }}>
            {YEARS.map((y) => (
              <button
                key={y}
                onClick={() => handleYearChange(y)}
                style={{
                  padding: "4px 12px", borderRadius: "999px", fontSize: "12px", letterSpacing: "0.08em",
                  background: year === y ? "rgba(232,201,122,0.12)" : "none",
                  border: year === y ? "1px solid rgba(232,201,122,0.4)" : "1px solid rgba(232,227,216,0.15)",
                  color: year === y ? "#E8C97A" : "rgba(232,227,216,0.5)",
                  cursor: "pointer",
                }}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        {/* Stats row */}
        {loading && (
          <div style={{ padding: "60px 0", color: "rgba(232,227,216,0.35)", fontSize: "14px", textAlign: "center" }}>
            映画手帳を読み込んでいます…
          </div>
        )}

        {error && !loading && (
          <div style={{ background: "rgba(216,90,48,0.08)", border: "1px solid rgba(216,90,48,0.25)", borderRadius: "12px", padding: "16px", marginBottom: "24px" }}>
            <p style={{ color: "#D85A30", fontSize: "14px", margin: "0 0 10px" }}>{error}</p>
            <button
              onClick={handleReload}
              style={{ padding: "8px 14px", borderRadius: "8px", background: "rgba(216,90,48,0.12)", border: "1px solid rgba(216,90,48,0.3)", color: "#D85A30", fontSize: "12px", cursor: "pointer" }}
            >
              再読み込み
            </button>
          </div>
        )}

        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "24px" }}>
            {[
              { label: "今年の本数", value: `${stats.totalCount}本` },
              { label: "平均スコア", value: stats.avgScore > 0 ? stats.avgScore.toFixed(1) : "—" },
              { label: "最多ジャンル", value: stats.topGenre || "—" },
              { label: "プロンプト使用", value: `${stats.promptUsedCount}本` },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "rgba(232,227,216,0.04)", border: "1px solid rgba(232,227,216,0.08)", borderRadius: "8px", padding: "12px" }}>
                <p style={{ fontSize: "10px", letterSpacing: "0.1em", color: "rgba(232,227,216,0.4)", margin: "0 0 4px" }}>{label}</p>
                <p style={{ fontFamily: "var(--font-dm-serif)", fontSize: "20px", color: "#E8C97A", margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main layout */}
      <div style={{ display: "flex", gap: "0", maxWidth: "960px", margin: "0 auto", padding: "0 20px" }}>
        {/* Shelf section */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {Object.keys(grouped).length === 0 && stats !== null && !loading && !error && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(232,227,216,0.3)", fontSize: "14px" }}>
              まだ記録がありません
            </div>
          )}

          {Object.entries(grouped).map(([genre, logs]) => (
            <div key={genre} style={{ marginBottom: "32px" }}>
              <p style={{ fontSize: "11px", letterSpacing: "0.1em", color: "rgba(232,227,216,0.4)", marginBottom: "12px" }}>
                {genre} <span style={{ color: "rgba(232,227,216,0.25)" }}>({logs.length})</span>
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "flex-end" }}>
                {logs.map((log) => {
                  const dotColor = log.emotion ? EMOTION_COLORS[log.emotion] : null;
                  return (
                    <Link
                      key={log.id}
                      href={`/movies/${log.movieId}`}
                      style={{ display: "block", textDecoration: "none", position: "relative" }}
                      title={log.movie.title}
                    >
                      <div
                        style={{
                          width: "44px", height: "66px", borderRadius: "3px",
                          background: GENRE_COLORS[genre] ?? "#1A1A2E",
                          border: "1px solid rgba(232,227,216,0.1)",
                          display: "flex", alignItems: "flex-end", justifyContent: "center",
                          padding: "4px 2px",
                          transition: "transform 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                      >
                        <span style={{ fontSize: "7px", color: "rgba(232,227,216,0.5)", textAlign: "center", lineHeight: 1.2, wordBreak: "break-all" }}>
                          {log.movie.title.slice(0, 8)}
                        </span>
                      </div>
                      {dotColor && (
                        <div style={{
                          position: "absolute", top: "4px", right: "4px",
                          width: "8px", height: "8px", borderRadius: "50%",
                          background: dotColor,
                        }} />
                      )}
                    </Link>
                  );
                })}
                {/* Add button */}
                <Link
                  href="/recommend"
                  style={{
                    width: "44px", height: "66px", borderRadius: "3px",
                    border: "1px dashed rgba(232,227,216,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "rgba(232,227,216,0.3)", fontSize: "20px", textDecoration: "none",
                    transition: "border-color 0.15s, color 0.15s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(232,201,122,0.4)"; (e.currentTarget as HTMLElement).style.color = "#E8C97A"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(232,227,216,0.2)"; (e.currentTarget as HTMLElement).style.color = "rgba(232,227,216,0.3)"; }}
                >
                  +
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Side panel */}
        <div style={{ width: "220px", flexShrink: 0, marginLeft: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Genre bar chart */}
          {stats && stats.byGenre.length > 0 && (
            <div>
              <p style={{ fontSize: "11px", letterSpacing: "0.08em", color: "rgba(232,227,216,0.4)", marginBottom: "10px" }}>ジャンル分布</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {stats.byGenre.slice(0, 6).map(({ genre, count }, i) => {
                  const pct = (count / maxGenreCount) * 100;
                  const color = i % 2 === 0 ? "#E8C97A" : "#7F77DD";
                  return (
                    <div key={genre} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "10px", color: "rgba(232,227,216,0.5)", width: "64px", textAlign: "right", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{genre}</span>
                      <div style={{ flex: 1, height: "4px", borderRadius: "999px", background: "rgba(232,227,216,0.08)" }}>
                        <div style={{ width: `${pct}%`, height: "100%", borderRadius: "999px", background: color }} />
                      </div>
                      <span style={{ fontSize: "10px", color: "rgba(232,227,216,0.4)", width: "16px" }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Emotion log */}
          {stats && stats.byEmotion.length > 0 && (
            <div>
              <p style={{ fontSize: "11px", letterSpacing: "0.08em", color: "rgba(232,227,216,0.4)", marginBottom: "10px" }}>感情ログ</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {stats.byEmotion.map(({ emotion, count }) => (
                  <div key={emotion} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: EMOTION_COLORS[emotion] ?? "#888", flexShrink: 0 }} />
                    <span style={{ fontSize: "11px", color: "rgba(232,227,216,0.6)", flex: 1 }}>{emotion}</span>
                    <span style={{ fontSize: "11px", color: "rgba(232,227,216,0.4)" }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monthly pace */}
          {stats && (
            <div>
              <p style={{ fontSize: "11px", letterSpacing: "0.08em", color: "rgba(232,227,216,0.4)", marginBottom: "10px" }}>月別ペース</p>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "60px" }}>
                {stats.byMonth.map(({ month, count }) => {
                  const h = maxMonthCount > 0 ? (count / maxMonthCount) * 52 : 0;
                  const isNow = month === currentMonth;
                  return (
                    <div key={month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                      <div style={{
                        width: "100%", height: `${Math.max(h, 2)}px`, borderRadius: "2px 2px 0 0",
                        background: isNow ? "#E8C97A" : "rgba(232,227,216,0.15)",
                        transition: "height 0.3s",
                      }} />
                      {month % 3 === 1 && (
                        <span style={{ fontSize: "8px", color: "rgba(232,227,216,0.3)" }}>{MONTH_LABELS[month - 1].replace("月", "")}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prompt banner */}
      {recentMovie && bannerPrompt && (
        <div style={{ maxWidth: "960px", margin: "32px auto 0", padding: "0 20px 40px" }}>
          <div style={{ background: "rgba(232,201,122,0.06)", border: "1px solid rgba(232,201,122,0.2)", borderRadius: "12px", padding: "20px 24px", display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "13px", color: "rgba(232,227,216,0.7)", margin: "0 0 4px" }}>
                「{recentMovie.title}」を観終わりましたか？
              </p>
              <p style={{ fontSize: "12px", color: "rgba(232,227,216,0.45)", margin: 0 }}>
                {recentMovie.directors[0] ?? "監督"}の視点でこの映画の核心を語るプロンプトが用意されています
              </p>
            </div>
            <button
              onClick={handleBannerCopy}
              style={{
                padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer", flexShrink: 0,
                background: bannerCopied ? "#5DCAA5" : "#E8C97A",
                color: "#080808", fontWeight: 600, fontSize: "13px",
                transition: "background 0.2s",
              }}
            >
              {bannerCopied ? "コピー済み ✓" : "プロンプトをコピー"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
