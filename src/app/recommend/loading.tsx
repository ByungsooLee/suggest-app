export default function LoadingRecommendPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-xl space-y-4 px-6 py-10">
      <div className="h-8 w-52 animate-pulse rounded-2xl bg-pink-200 dark:bg-pink-900/40" />
      <div className="h-64 animate-pulse rounded-3xl bg-violet-200 dark:bg-violet-900/40" />
      <div className="h-24 animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
    </main>
  );
}
