type ReactionPillProps = {
  label: string;
  emoji: string;
  onClick?: () => void;
  disabled?: boolean;
};

export function ReactionPill({ label, emoji, onClick, disabled = false }: ReactionPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </button>
  );
}
