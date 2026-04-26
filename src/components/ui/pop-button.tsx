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
    "inline-flex items-center justify-center rounded-[var(--radius-md)] px-5 py-3 text-sm font-[500] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60";
  const palette =
    variant === "primary"
      ? "bg-[var(--color-accent)] text-[#080808] hover:brightness-105"
      : variant === "secondary"
        ? "border border-[var(--color-border)] bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)]"
        : "border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.06)]";

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${palette} ${className}`.trim()}>
      {children}
    </button>
  );
}
