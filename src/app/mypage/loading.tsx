export default function LoadingMyPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl space-y-4 px-6 py-10">
      <div className="h-8 w-40 animate-pulse rounded-2xl bg-[var(--color-accent-glow)]" />
      <div className="h-20 animate-pulse rounded-3xl bg-[var(--color-bg-surface)]" />
      <div className="h-72 animate-pulse rounded-3xl bg-[var(--color-bg-elevated)]" />
    </main>
  );
}
