"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

type Props = {
  onConfirm: (reasons: string[]) => void;
  onSkip: () => void;
};

export function ReasonTagPicker({ onConfirm, onSkip }: Props) {
  const t = useTranslations("discover");
  const [selected, setSelected] = useState<string[]>([]);
  const reasonTags = [
    { id: "director", label: t("reasons.director") },
    { id: "visual", label: t("reasons.visual") },
    { id: "genre", label: t("reasons.genre") },
    { id: "story", label: t("reasons.story") },
    { id: "actor", label: t("reasons.actor") },
    { id: "mood", label: t("reasons.mood") },
  ];

  const toggle = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  return (
    <div style={{
      animation: "fadeIn 0.35s ease both",
      background: "#141418", border: "1px solid rgba(232,227,216,0.08)",
      borderRadius: "16px", padding: "20px 16px",
    }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <p style={{ fontSize: "13px", color: "rgba(232,227,216,0.55)", margin: "0 0 14px", textAlign: "center" }}>
        {t("reasonTitle")}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
        {reasonTags.map(({ id, label }) => {
          const active = selected.includes(id);
          return (
            <button
              key={id}
              onClick={() => toggle(id)}
              style={{
                padding: "7px 14px", borderRadius: "999px", fontSize: "13px",
                cursor: "pointer", transition: "all 150ms",
                background: active ? "rgba(232,201,122,0.12)" : "rgba(232,227,216,0.05)",
                border: active ? "1px solid rgba(232,201,122,0.5)" : "1px solid rgba(232,227,216,0.1)",
                color: active ? "#E8C97A" : "rgba(232,227,216,0.6)",
                fontWeight: active ? 500 : 400,
              }}
            >{label}</button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={onSkip}
          style={{
            flex: 1, padding: "10px", borderRadius: "8px",
            background: "rgba(232,227,216,0.04)", border: "1px solid rgba(232,227,216,0.1)",
            color: "rgba(232,227,216,0.45)", fontSize: "13px", cursor: "pointer",
          }}
        >{t("reasonSkip")}</button>
        <button
          onClick={() => onConfirm(selected)}
          style={{
            flex: 2, padding: "10px", borderRadius: "8px",
            background: "rgba(232,201,122,0.12)", border: "1px solid rgba(232,201,122,0.35)",
            color: "#E8C97A", fontSize: "13px", fontWeight: 600, cursor: "pointer",
          }}
        >{t("reasonSave")}</button>
      </div>
    </div>
  );
}
