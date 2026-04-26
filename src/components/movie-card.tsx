import Image from "next/image";

import { PopCard } from "@/components/ui/pop-card";
import { ReasonBadge } from "@/components/ui/reason-badge";

type Reason = { text: string; type?: "mood_match" | "context_match" | "runtime_fit" | "style_match" };

type MovieCardProps = {
  title: string;
  reasons: Reason[];
  rank: number;
  primary?: boolean;
  posterUrl?: string | null;
  overview?: string | null;
  directors?: string[];
  cast?: string[];
  reviewScore?: number | null;
  reviewSummary?: string | null;
  onOpen?: () => void;
};

export function MovieCard({
  title,
  reasons,
  rank,
  primary = false,
  posterUrl,
  overview,
  directors = [],
  cast = [],
  reviewScore,
  reviewSummary,
  onOpen,
}: MovieCardProps) {
  const rankLabel = rank === 1 ? "Top Pick" : `Backup ${rank - 1}`;
  const metaLine = [
    directors.length ? directors[0] : null,
    typeof reviewScore === "number" && Number.isFinite(reviewScore) ? `${reviewScore.toFixed(1)}/10` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <PopCard tone={primary ? "highlight" : "surface"} className={primary ? "border-[var(--color-border-accent)]" : ""}>
      <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
        <div className="relative aspect-[2/3] w-full overflow-hidden">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={`${title} poster`}
              fill
              className="object-cover transition duration-300 hover:scale-[1.03] hover:brightness-110"
              sizes="(max-width: 768px) 92vw, (max-width: 1200px) 60vw, 420px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-[var(--color-text-secondary)]">No Image</div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--color-bg-void)] via-[rgba(8,8,8,0.88)] to-transparent" />
          <div className="absolute left-3 top-3 rounded-full border border-[var(--color-border-accent)] bg-[var(--color-accent-dim)] px-3 py-1 text-[0.7rem] font-[500] tracking-[0.06em] text-[var(--color-accent)]">
            {rankLabel}
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            <h2 className="text-movie-title line-clamp-2">{title}</h2>
            <p className="mt-1 text-xs font-[500] text-[var(--color-text-secondary)]">
              {metaLine || "今夜向けのバランス候補"}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <p className="text-body line-clamp-3">{overview ?? "あらすじ情報は準備中です。"}</p>
        <div className="flex flex-wrap gap-2">
          {reasons.slice(0, 3).map((reason, idx) => (
            <ReasonBadge key={`${title}-${idx}`} type={reason.type ?? "mood_match"} text={`✓ ${reason.text}`} />
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
          <span className="truncate">主演: {cast.length ? cast.slice(0, 2).join(", ") : "情報なし"}</span>
          <button
            type="button"
            disabled={!onOpen}
            aria-disabled={!onOpen}
            onClick={onOpen}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-2 py-1 text-[var(--color-text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            観る ↗
          </button>
        </div>
        {reviewSummary && <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">{reviewSummary}</p>}
      </div>
    </PopCard>
  );
}
