import { type ReactNode } from "react";

type PopButtonProps = {
  children: ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  onClick?: () => void;
};

export function PopButton({
  children,
  type = "button",
  disabled = false,
  variant = "primary",
  className = "",
  onClick,
}: PopButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";
  const palette =
    variant === "primary"
      ? "bg-pink-500 text-white shadow-lg shadow-pink-500/30 hover:bg-pink-400"
      : variant === "secondary"
        ? "bg-amber-300 text-zinc-900 shadow-lg shadow-amber-300/40 hover:bg-amber-200"
        : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800";

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${palette} ${className}`.trim()}>
      {children}
    </button>
  );
}
