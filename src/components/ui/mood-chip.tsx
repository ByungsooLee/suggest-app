type MoodChipProps = {
  label: string;
  selected?: boolean;
  onClick?: () => void;
};

export function MoodChip({ label, selected = false, onClick }: MoodChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[var(--radius-full)] border px-3 py-1.5 text-xs font-[300] transition ${
        selected
          ? "border-[var(--color-border-accent)] bg-[var(--color-accent-dim)] text-[var(--color-accent)]"
          : "border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
      }`}
    >
      {label}
    </button>
  );
}
