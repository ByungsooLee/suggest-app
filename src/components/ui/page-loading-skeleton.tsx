type PageLoadingSkeletonProps = {
  maxWidth?: "xl" | "2xl" | "6xl";
  blocks?: Array<{ height: string; width?: string }>;
};

const maxWidthClass = {
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "6xl": "max-w-6xl",
} as const;

export function PageLoadingSkeleton({ maxWidth = "xl", blocks }: PageLoadingSkeletonProps) {
  const defaultBlocks = [
    { height: "h-8", width: "w-56" },
    { height: "h-20" },
    { height: "h-80" },
  ];

  return (
    <main className={`mx-auto min-h-screen w-full ${maxWidthClass[maxWidth]} space-y-4 px-6 py-10`}>
      {(blocks ?? defaultBlocks).map((block, index) => (
        <div
          key={index}
          className={`${block.height} ${block.width ?? "w-full"} animate-pulse rounded-3xl bg-[var(--color-bg-surface)] first:rounded-2xl first:bg-[var(--color-accent-glow)]`}
        />
      ))}
    </main>
  );
}
