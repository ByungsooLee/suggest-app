export default function LoadingResultPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl space-y-5 px-6 py-10">
      <div className="h-8 w-56 animate-pulse rounded-2xl bg-pink-200 dark:bg-pink-900/40" />
      <div className="h-52 animate-pulse rounded-3xl bg-violet-200 dark:bg-violet-900/40" />
      <div className="h-40 animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-40 animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
    </main>
  );
}
