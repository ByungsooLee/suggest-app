export default function LoadingRecommendPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-xl space-y-4 px-6 py-10">
      <div className="h-8 w-52 animate-pulse rounded-2xl bg-[var(--color-accent-glow)]" />
      <div className="h-64 animate-pulse rounded-3xl bg-[var(--color-bg-elevated)]" />
      <div className="h-24 animate-pulse rounded-3xl bg-[var(--color-bg-surface)]" />
    </main>
  );
}
