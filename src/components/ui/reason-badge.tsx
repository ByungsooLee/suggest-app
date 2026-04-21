type ReasonType = "mood_match" | "context_match" | "runtime_fit" | "style_match";

const reasonEmoji: Record<ReasonType, string> = {
  mood_match: "🎯",
  context_match: "👥",
  runtime_fit: "⏱️",
  style_match: "✨",
};

type ReasonBadgeProps = {
  type: ReasonType;
  text: string;
};

export function ReasonBadge({ type, text }: ReasonBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-white px-2.5 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
      <span>{reasonEmoji[type]}</span>
      <span>{text}</span>
    </span>
  );
}
