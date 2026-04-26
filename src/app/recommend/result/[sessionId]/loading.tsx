export default function LoadingResultPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl space-y-5 px-6 py-10">
      <div className="h-8 w-56 animate-pulse rounded-2xl bg-[var(--color-accent-glow)]" />
      <div className="h-52 animate-pulse rounded-3xl bg-[var(--color-bg-elevated)]" />
      <div className="h-40 animate-pulse rounded-3xl bg-[var(--color-bg-surface)]" />
      <div className="h-40 animate-pulse rounded-3xl bg-[var(--color-bg-surface)]" />
    </main>
  );
}
