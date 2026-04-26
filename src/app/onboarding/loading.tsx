export default function LoadingOnboardingPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-xl space-y-4 px-6 py-10">
      <div className="h-8 w-56 animate-pulse rounded-2xl bg-[var(--color-accent-glow)]" />
      <div className="h-20 animate-pulse rounded-3xl bg-[var(--color-bg-elevated)]" />
      <div className="h-80 animate-pulse rounded-3xl bg-[var(--color-bg-surface)]" />
    </main>
  );
}
