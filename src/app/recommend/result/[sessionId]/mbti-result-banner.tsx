"use client";

import { useEffect, useState } from "react";

type MbtiContext = {
  types: string[];
  score: number;
  chemistry: string;
  decisionHook: string;
  watchingWith: "pair" | "group";
};

const SCORE_LABELS = ["難", "要注意", "無難", "良好", "伝説"];

export function MbtiResultBanner() {
  const [ctx, setCtx] = useState<MbtiContext | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("mbtiRecommendContext");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as MbtiContext;
      setCtx(parsed);
    } catch {
      // ignore
    }
  }, []);

  if (!ctx) return null;

  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap",
        padding: "10px 14px", borderRadius: "8px", marginBottom: "16px",
        background: "rgba(232,201,122,0.06)", border: "1px solid rgba(232,201,122,0.2)",
      }}
    >
      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
        {ctx.types.map((t, i) => (
          <span
            key={`${t}-${i}`}
            style={{
              fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em",
              padding: "2px 8px", borderRadius: "999px",
              background: "rgba(232,201,122,0.12)", color: "#E8C97A",
              border: "1px solid rgba(232,201,122,0.3)",
            }}
          >
            {t}
          </span>
        ))}
      </div>
      <span style={{ fontSize: "12px", color: "rgba(232,227,216,0.55)", flex: 1, minWidth: "160px" }}>
        {ctx.chemistry} — {SCORE_LABELS[ctx.score - 1]}の組み合わせ
      </span>
    </div>
  );
}

export function MbtiDecisionHook({ title }: { title: string }) {
  const [ctx, setCtx] = useState<MbtiContext | null>(null);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("mbtiRecommendContext");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as MbtiContext;
      setCtx(parsed);
    } catch {
      // ignore
    }
    if (!cleared) {
      sessionStorage.removeItem("mbtiRecommendContext");
      setCleared(true);
    }
  }, [cleared, title]);

  if (!ctx) return null;

  return (
    <div
      style={{
        marginTop: "10px", padding: "10px 12px", borderRadius: "8px",
        background: "rgba(232,227,216,0.03)", border: "1px solid rgba(232,227,216,0.08)",
      }}
    >
      <p style={{ fontSize: "10px", letterSpacing: "0.08em", color: "rgba(232,227,216,0.35)", margin: "0 0 4px" }}>
        {ctx.types.join(" × ")} だから
      </p>
      <p style={{ fontSize: "12px", color: "rgba(232,227,216,0.65)", margin: 0, lineHeight: 1.55 }}>
        {ctx.decisionHook}
      </p>
    </div>
  );
}
