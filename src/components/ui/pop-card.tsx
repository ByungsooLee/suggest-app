import { type ReactNode } from "react";

type PopCardProps = {
  children: ReactNode;
  tone?: "surface" | "highlight" | "muted";
  className?: string;
};

export function PopCard({ children, tone = "surface", className = "" }: PopCardProps) {
  const toneClass =
    tone === "highlight"
      ? "border-pink-300 bg-gradient-to-br from-pink-100 to-purple-100 dark:border-pink-500/40 dark:from-pink-950/60 dark:to-purple-950/60"
      : tone === "muted"
        ? "border-zinc-200 bg-white/80 dark:border-zinc-800 dark:bg-zinc-900/80"
        : "border-violet-200 bg-white dark:border-violet-900/60 dark:bg-zinc-950/80";

  return (
    <section className={`rounded-3xl border p-5 shadow-lg shadow-zinc-950/5 ${toneClass} ${className}`.trim()}>
      {children}
    </section>
  );
}
