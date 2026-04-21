import Image from "next/image";

import { PopCard } from "@/components/ui/pop-card";
import { ReasonBadge } from "@/components/ui/reason-badge";

type Reason = { text: string; type?: "mood_match" | "context_match" | "runtime_fit" | "style_match" };

type MovieCardProps = {
  title: string;
  score: number;
  reasons: Reason[];
  rank: number;
  primary?: boolean;
  posterUrl?: string | null;
  overview?: string | null;
  directors?: string[];
  cast?: string[];
  reviewScore?: number | null;
  reviewSummary?: string | null;
};

export function MovieCard({
  title,
  score,
  reasons,
  rank,
  primary = false,
  posterUrl,
  overview,
  directors = [],
  cast = [],
  reviewScore,
  reviewSummary,
}: MovieCardProps) {
  return (
    <PopCard tone={primary ? "highlight" : "surface"} className={primary ? "ring-2 ring-pink-400/40" : ""}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          {rank === 1 ? "Tonight's Top Pick" : `Backup ${rank - 1}`}
        </p>
        <p className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-bold text-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200">
          {(score * 100).toFixed(0)}% match
        </p>
      </div>
      <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-[104px_1fr]">
        <div className="h-[148px] w-[104px] overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
          {posterUrl ? (
            <Image src={posterUrl} alt={`${title} poster`} width={104} height={148} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-500">No Image</div>
          )}
        </div>
        <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
          <p>{overview ?? "あらすじ情報は準備中です。"}</p>
          <p>監督: {directors.length ? directors.join(", ") : "情報なし"}</p>
          <p>主演: {cast.length ? cast.slice(0, 3).join(", ") : "情報なし"}</p>
          <p>
            レビュー: {reviewScore ? `${reviewScore.toFixed(1)}/10` : "未評価"}
            {reviewSummary ? ` - ${reviewSummary}` : ""}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {reasons.slice(0, 3).map((reason, idx) => (
          <ReasonBadge key={`${title}-${idx}`} type={reason.type ?? "mood_match"} text={reason.text} />
        ))}
      </div>
    </PopCard>
  );
}
