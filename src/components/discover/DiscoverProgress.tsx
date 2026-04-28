"use client";

import { useTranslations } from "next-intl";

const MILESTONES = [
  { count: 10, key: "10" },
  { count: 25, key: "25" },
  { count: 50, key: "50" },
  { count: 100, key: "100" },
];

type Props = { totalSwipes: number; personalityLabel: string | null };

export function DiscoverProgress({ totalSwipes, personalityLabel }: Props) {
  const discoverT = useTranslations("discover");
  const mypageT = useTranslations("mypage.personality");
  const inCycle = totalSwipes % 100;
  const progress = inCycle / 100;
  const milestone = [...MILESTONES].reverse().find((m) => totalSwipes >= m.count);

  return (
    <div style={{ marginBottom: "16px" }}>
      {personalityLabel ? (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
          <span style={{ fontSize: "11px", letterSpacing: "0.08em", color: "rgba(232,201,122,0.7)" }}>✦</span>
          <span style={{ fontSize: "13px", color: "#E8C97A", fontWeight: 500 }}>{personalityLabel}</span>
        </div>
      ) : totalSwipes < 100 ? (
        <p style={{ fontSize: "12px", color: "rgba(232,227,216,0.4)", margin: "0 0 8px" }}>
          {mypageT("progress", { remaining: 100 - totalSwipes })}
        </p>
      ) : null}

      {milestone && milestone.count === totalSwipes && (
        <p style={{ fontSize: "12px", color: "#5DCAA5", margin: "0 0 8px" }}>
          {discoverT(`milestone.${milestone.key}`)}
        </p>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ flex: 1, height: "4px", borderRadius: "999px", background: "rgba(232,227,216,0.08)", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: "999px",
            background: "linear-gradient(90deg, rgba(232,201,122,0.5), #E8C97A)",
            width: `${Math.max(2, progress * 100)}%`,
            transition: "width 500ms cubic-bezier(0.16,1,0.3,1)",
          }} />
        </div>
        <span style={{ fontSize: "11px", color: "rgba(232,227,216,0.4)", whiteSpace: "nowrap" }}>
          {inCycle} / 100
        </span>
      </div>
    </div>
  );
}
