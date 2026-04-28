export default function LoadingResultPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <div className="skeleton mb-6 h-7 w-40" />
      <div className="skeleton mb-3 h-5 w-64" />
      <section className="recommend-grid mt-6">
        <div className="skeleton aspect-[2/3] w-full" style={{ borderRadius: "var(--radius-xl)" }} />
        <div className="skeleton aspect-[2/3] w-full" style={{ borderRadius: "var(--radius-xl)" }} />
        <div className="skeleton aspect-[2/3] w-full" style={{ borderRadius: "var(--radius-xl)" }} />
      </section>
    </main>
  );
}
