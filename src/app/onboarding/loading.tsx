export default function LoadingOnboardingPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-xl space-y-4 px-6 py-10">
      <div className="h-8 w-56 animate-pulse rounded-2xl bg-pink-200 dark:bg-pink-900/40" />
      <div className="h-20 animate-pulse rounded-3xl bg-amber-200 dark:bg-amber-900/40" />
      <div className="h-80 animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
    </main>
  );
}
