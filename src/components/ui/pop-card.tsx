import { type ReactNode } from "react";

type PopCardProps = {
  children: ReactNode;
  tone?: "surface" | "highlight" | "muted";
  className?: string;
};

export function PopCard({ children, tone = "surface", className = "" }: PopCardProps) {
  const toneClass =
    tone === "highlight"
      ? "border-[var(--color-border-accent)] bg-[var(--color-bg-surface)]"
      : tone === "muted"
        ? "border-[var(--color-border)] bg-[var(--color-bg-elevated)]"
        : "border-[var(--color-border)] bg-[var(--color-bg-surface)]";

  return (
    <section className={`rounded-[var(--radius-xl)] border p-5 ${toneClass} ${className}`.trim()}>
      {children}
    </section>
  );
}
