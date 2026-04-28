"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  getCompatibility,
  getGroupCompatibility,
  type MBTIType,
  type CompatibilityScore,
  type CompatibilityData,
} from "@/lib/mbti/compatibility";

const MBTI_TYPES: MBTIType[] = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISTP", "ESTJ", "ESTP",
  "ISFJ", "ISFP", "ESFJ", "ESFP",
];

const SCORE_CONFIG: Record<CompatibilityScore, { label: string; color: string; bg: string }> = {
  5: { label: "伝説的ペア", color: "#E8C97A", bg: "rgba(232,201,122,0.12)" },
  4: { label: "相性良好",   color: "#5DCAA5", bg: "rgba(93,202,165,0.1)"  },
  3: { label: "無難",       color: "#7F77DD", bg: "rgba(127,119,221,0.1)" },
  2: { label: "要注意",     color: "#D85A30", bg: "rgba(216,90,48,0.1)"   },
  1: { label: "難易度高",   color: "#D4537E", bg: "rgba(212,83,126,0.1)"  },
};

type Props = { myMbti: string | null };

function saveMbtiContext(types: string[], compat: CompatibilityData, watchingWith: "pair" | "group") {
  sessionStorage.setItem(
    "mbtiRecommendContext",
    JSON.stringify({
      types,
      score: compat.score,
      chemistry: compat.chemistry,
      movieGenres: compat.movieGenres,
      decisionHook: compat.decisionHook,
      exampleMovies: compat.exampleMovies,
      watchingWith,
    }),
  );
}

export function MbtiCompatibilityClient({ myMbti }: Props) {
  const router = useRouter();
  const [typeA, setTypeA] = useState<MBTIType | "">(
    (myMbti as MBTIType | null) ?? ""
  );
  const [typeB, setTypeB] = useState<MBTIType | "">("");
  const [mode, setMode] = useState<"pair" | "group">("pair");
  const [groupTypes, setGroupTypes] = useState<MBTIType[]>(
    myMbti ? [myMbti as MBTIType] : []
  );

  const pairResult = typeA && typeB ? getCompatibility(typeA, typeB) : null;
  const groupResult = groupTypes.length >= 2 ? getGroupCompatibility(groupTypes) : null;
  const scoreConfig = pairResult ? SCORE_CONFIG[pairResult.score] : null;

  const toggleGroupType = (t: MBTIType) => {
    setGroupTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : prev.length < 6 ? [...prev, t] : prev
    );
  };

  return (
    <div style={{ background: "#0e0e0f", minHeight: "100vh", color: "#e8e3d8", fontFamily: "var(--font-dm-sans)", paddingBottom: "80px" }}>
      {/* TopBar */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(232,227,216,0.08)", display: "flex", alignItems: "center", gap: "12px" }}>
        <Link href="/mypage" style={{ color: "rgba(232,227,216,0.4)", fontSize: "13px", textDecoration: "none" }}>← マイページ</Link>
        <span style={{ fontFamily: "var(--font-dm-serif)", fontSize: "18px" }}>MBTI 映画相性</span>
      </div>

      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "24px 16px" }}>
        {/* Mode toggle */}
        <div style={{ display: "flex", gap: "0", marginBottom: "28px", border: "1px solid rgba(232,227,216,0.12)", borderRadius: "8px", overflow: "hidden" }}>
          {(["pair", "group"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1, padding: "10px", fontSize: "12px", letterSpacing: "0.08em",
                background: mode === m ? "rgba(232,201,122,0.1)" : "none",
                border: "none", cursor: "pointer",
                color: mode === m ? "#E8C97A" : "rgba(232,227,216,0.45)",
                borderRight: m === "pair" ? "1px solid rgba(232,227,216,0.12)" : "none",
              }}
            >
              {m === "pair" ? "2人の相性" : "グループ相性"}
            </button>
          ))}
        </div>

        {/* Pair mode */}
        {mode === "pair" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "12px", alignItems: "center", marginBottom: "28px" }}>
              <MbtiSelector value={typeA} onChange={setTypeA} label="あなた" />
              <span style={{ fontSize: "20px", color: "rgba(232,227,216,0.25)" }}>×</span>
              <MbtiSelector value={typeB} onChange={setTypeB} label="相手" />
            </div>

            {pairResult && scoreConfig && (
              <div style={{ animation: "fadeIn 0.3s ease" }}>
                {/* Score header */}
                <div style={{ background: scoreConfig.bg, border: `1px solid ${scoreConfig.color}40`, borderRadius: "12px", padding: "20px 24px", marginBottom: "20px", textAlign: "center" }}>
                  <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginBottom: "8px" }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} style={{ width: "12px", height: "12px", borderRadius: "50%", background: i < pairResult.score ? scoreConfig.color : "rgba(232,227,216,0.1)" }} />
                    ))}
                  </div>
                  <p style={{ fontFamily: "var(--font-dm-serif)", fontSize: "22px", color: scoreConfig.color, margin: "0 0 4px" }}>
                    {scoreConfig.label}
                  </p>
                  <p style={{ fontSize: "14px", color: "rgba(232,227,216,0.7)", margin: 0 }}>
                    {pairResult.chemistry}
                  </p>
                </div>

                {/* Details */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <DetailCard icon="🎬" title="観る時の雰囲気" content={pairResult.atmosphere} />
                  <DetailCard icon="💬" title="観た後の会話" content={pairResult.afterTalk} />
                  <DetailCard icon="✦" title="今夜の決め台詞" content={pairResult.decisionHook} accent />

                  {/* Genres */}
                  <div style={{ background: "rgba(232,227,216,0.03)", border: "1px solid rgba(232,227,216,0.08)", borderRadius: "10px", padding: "16px" }}>
                    <p style={{ fontSize: "11px", letterSpacing: "0.1em", color: "rgba(232,227,216,0.4)", margin: "0 0 10px" }}>合うジャンル</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {pairResult.movieGenres.map((g) => (
                        <span key={g} style={{ fontSize: "11px", padding: "3px 10px", border: "1px solid rgba(232,227,216,0.15)", borderRadius: "999px", color: "rgba(232,227,216,0.7)" }}>{g}</span>
                      ))}
                    </div>
                  </div>

                  {/* Movies */}
                  <div style={{ background: "rgba(232,227,216,0.03)", border: "1px solid rgba(232,227,216,0.08)", borderRadius: "10px", padding: "16px" }}>
                    <p style={{ fontSize: "11px", letterSpacing: "0.1em", color: "rgba(232,227,216,0.4)", margin: "0 0 10px" }}>おすすめ映画</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {pairResult.exampleMovies.map((m) => (
                        <div key={m} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "10px", color: "#E8C97A" }}>▸</span>
                          <span style={{ fontSize: "13px", color: "rgba(232,227,216,0.8)" }}>{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={() => {
                    saveMbtiContext([typeA, typeB], pairResult, "pair");
                    router.push("/recommend?from=mbti");
                  }}
                  style={{
                    display: "block", width: "100%", marginTop: "24px", padding: "14px", borderRadius: "10px",
                    background: "#E8C97A", color: "#080808", fontWeight: 600, fontSize: "14px",
                    textAlign: "center", letterSpacing: "0.05em", border: "none", cursor: "pointer",
                  }}
                >
                  今夜の1本を探す →
                </button>
              </div>
            )}

            {!typeA || !typeB ? (
              <p style={{ fontSize: "13px", color: "rgba(232,227,216,0.3)", textAlign: "center", marginTop: "32px" }}>
                2人のMBTIを選ぶと相性が表示されます
              </p>
            ) : null}
          </>
        )}

        {/* Group mode */}
        {mode === "group" && (
          <>
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "11px", letterSpacing: "0.08em", color: "rgba(232,227,216,0.4)", marginBottom: "12px" }}>
                メンバーのMBTIを選択（2〜6人）
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                {MBTI_TYPES.map((t) => {
                  const selected = groupTypes.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() => toggleGroupType(t)}
                      style={{
                        padding: "10px 4px", borderRadius: "8px", fontSize: "12px", letterSpacing: "0.08em",
                        cursor: "pointer", fontWeight: selected ? 600 : 400,
                        background: selected ? "rgba(232,201,122,0.12)" : "rgba(232,227,216,0.04)",
                        border: selected ? "1px solid rgba(232,201,122,0.5)" : "1px solid rgba(232,227,216,0.1)",
                        color: selected ? "#E8C97A" : "rgba(232,227,216,0.6)",
                        transition: "all 0.15s",
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
              {groupTypes.length >= 6 && (
                <p style={{ fontSize: "11px", color: "rgba(232,227,216,0.35)", marginTop: "8px", textAlign: "center" }}>最大6人まで</p>
              )}
            </div>

            {groupResult && (
              <div>
                <div style={{ background: "rgba(232,227,216,0.04)", border: "1px solid rgba(232,227,216,0.1)", borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div>
                      <p style={{ fontSize: "11px", letterSpacing: "0.1em", color: "rgba(232,227,216,0.4)", margin: "0 0 4px" }}>平均相性スコア</p>
                      <p style={{ fontFamily: "var(--font-dm-serif)", fontSize: "28px", color: "#E8C97A", margin: 0 }}>{groupResult.avgScore.toFixed(1)}<span style={{ fontSize: "14px", color: "rgba(232,227,216,0.4)", marginLeft: "4px" }}>/5</span></p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "11px", letterSpacing: "0.1em", color: "rgba(232,227,216,0.4)", margin: "0 0 4px" }}>最低スコア</p>
                      <p style={{ fontFamily: "var(--font-dm-serif)", fontSize: "20px", color: groupResult.minScore >= 3 ? "#5DCAA5" : "#D85A30", margin: 0 }}>{groupResult.minScore}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: "13px", color: "rgba(232,227,216,0.7)", margin: 0, lineHeight: 1.6 }}>{groupResult.recommendation}</p>
                </div>

                {/* Pairs breakdown */}
                <p style={{ fontSize: "11px", letterSpacing: "0.08em", color: "rgba(232,227,216,0.4)", marginBottom: "10px" }}>ペア別スコア</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {groupResult.pairs.map(({ typeA: tA, typeB: tB, score }) => {
                    const cfg = SCORE_CONFIG[score as CompatibilityScore];
                    return (
                      <div key={`${tA}-${tB}`} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "8px", background: "rgba(232,227,216,0.03)", border: "1px solid rgba(232,227,216,0.06)" }}>
                        <span style={{ fontSize: "12px", letterSpacing: "0.08em", flex: 1 }}>{tA} × {tB}</span>
                        <div style={{ display: "flex", gap: "3px" }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: i < score ? cfg.color : "rgba(232,227,216,0.1)" }} />
                          ))}
                        </div>
                        <span style={{ fontSize: "11px", color: cfg.color, width: "48px", textAlign: "right" }}>{cfg.label}</span>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    const avgCompat = getCompatibility(groupTypes[0], groupTypes[1]);
                    saveMbtiContext(groupTypes, avgCompat, "group");
                    router.push("/recommend?from=mbti");
                  }}
                  style={{
                    display: "block", width: "100%", marginTop: "20px", padding: "14px", borderRadius: "10px",
                    background: "#E8C97A", color: "#080808", fontWeight: 600, fontSize: "14px",
                    textAlign: "center", letterSpacing: "0.05em", border: "none", cursor: "pointer",
                  }}
                >
                  グループで観る映画を探す →
                </button>
              </div>
            )}

            {groupTypes.length < 2 && (
              <p style={{ fontSize: "13px", color: "rgba(232,227,216,0.3)", textAlign: "center", marginTop: "32px" }}>
                2人以上選ぶとグループ相性が表示されます
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function MbtiSelector({ value, onChange, label }: {
  value: MBTIType | "";
  onChange: (v: MBTIType | "") => void;
  label: string;
}) {
  return (
    <div>
      <p style={{ fontSize: "10px", letterSpacing: "0.1em", color: "rgba(232,227,216,0.4)", marginBottom: "6px", textAlign: "center" }}>{label}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
        {MBTI_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => onChange(value === t ? "" : t)}
            style={{
              padding: "7px 4px", borderRadius: "6px", fontSize: "11px", letterSpacing: "0.06em",
              cursor: "pointer",
              background: value === t ? "rgba(232,201,122,0.12)" : "rgba(232,227,216,0.04)",
              border: value === t ? "1px solid rgba(232,201,122,0.5)" : "1px solid rgba(232,227,216,0.08)",
              color: value === t ? "#E8C97A" : "rgba(232,227,216,0.55)",
              fontWeight: value === t ? 600 : 400,
              transition: "all 0.15s",
            }}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

function DetailCard({ icon, title, content, accent }: { icon: string; title: string; content: string; accent?: boolean }) {
  return (
    <div style={{
      background: accent ? "rgba(232,201,122,0.05)" : "rgba(232,227,216,0.03)",
      border: `1px solid ${accent ? "rgba(232,201,122,0.2)" : "rgba(232,227,216,0.08)"}`,
      borderRadius: "10px", padding: "14px 16px",
    }}>
      <p style={{ fontSize: "11px", letterSpacing: "0.08em", color: "rgba(232,227,216,0.4)", margin: "0 0 6px" }}>{icon} {title}</p>
      <p style={{ fontSize: "13px", lineHeight: 1.65, color: accent ? "#E8C97A" : "rgba(232,227,216,0.8)", margin: 0, fontFamily: accent ? "var(--font-dm-serif)" : "inherit", fontStyle: accent ? "italic" : "normal" }}>{content}</p>
    </div>
  );
}
