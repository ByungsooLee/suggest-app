"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

const QUICK_MOODS = [
  { emoji: "😤", mood: "funny" },
  { emoji: "💓", mood: "tense" },
  { emoji: "🥹", mood: "emotional" },
  { emoji: "✨", mood: "stylish" },
  { emoji: "🌙", mood: "melancholic" },
  { emoji: "☀️", mood: "uplifting" },
] as const;

export function HomeMoodChips({ isLoggedIn }: { isLoggedIn: boolean }) {
  const homeT = useTranslations("home");
  const formT = useTranslations("recommendForm.moods");
  const router = useRouter();

  const handleMood = (mood: string) => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    sessionStorage.setItem("presetMood", mood);
    router.push("/recommend?from=mood");
  };

  return (
    <section style={{ padding: "0 0 8px" }}>
      <p style={{ fontSize: "11px", letterSpacing: "0.1em", color: "rgba(240,237,232,0.35)", marginBottom: "12px" }}>
        {homeT("moodLabel")}
      </p>
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px", scrollbarWidth: "none" }}>
        {QUICK_MOODS.map(({ emoji, mood }) => (
          <button
            key={mood}
            onClick={() => handleMood(mood)}
            className="ripple-container"
            style={{
              flexShrink: 0,
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 14px", borderRadius: "999px",
              background: "rgba(240,237,232,0.05)", border: "1px solid rgba(240,237,232,0.1)",
              color: "rgba(240,237,232,0.7)", fontSize: "13px",
              cursor: "pointer", whiteSpace: "nowrap",
              transition: "border-color 200ms, background 200ms",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(232,201,122,0.35)";
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(232,201,122,0.07)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,237,232,0.1)";
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(240,237,232,0.05)";
            }}
          >
            <span>{emoji}</span>
            <span>{formT(mood)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
