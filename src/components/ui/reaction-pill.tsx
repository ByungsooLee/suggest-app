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
      className="inline-flex items-center gap-1 rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-1.5 text-xs font-[300] text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)] disabled:opacity-60"
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </button>
  );
}
