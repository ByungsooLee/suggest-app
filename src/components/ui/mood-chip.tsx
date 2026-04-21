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
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
        selected
          ? "bg-violet-500 text-white shadow-md shadow-violet-500/30"
          : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
      }`}
    >
      {label}
    </button>
  );
}
