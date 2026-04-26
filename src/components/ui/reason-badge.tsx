type ReasonType =
  | "mood_match"
  | "context_match"
  | "runtime_fit"
  | "style_match"
  | "actor_match"
  | "director_match"
  | "genre_match"
  | "review_match";

const reasonEmoji: Record<ReasonType, string> = {
  mood_match: "🎯",
  context_match: "👥",
  runtime_fit: "⏱️",
  style_match: "✨",
  actor_match: "🎬",
  director_match: "🧭",
  genre_match: "🎞️",
  review_match: "⭐",
};

type ReasonBadgeProps = {
  type: ReasonType;
  text: string;
};

export function ReasonBadge({ type, text }: ReasonBadgeProps) {
  const highlightTypes: ReasonType[] = ["mood_match", "context_match", "director_match", "actor_match", "genre_match"];
  const highlight = highlightTypes.includes(type);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[0.8125rem] ${
        highlight
          ? "border-[var(--color-border-accent)] bg-[var(--color-accent-dim)] text-[var(--color-accent)]"
          : "border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]"
      }`}
    >
      <span>{reasonEmoji[type]}</span>
      <span>{text}</span>
    </span>
  );
}
