import { PopCard } from "@/components/ui/pop-card";
import { ReasonBadge } from "@/components/ui/reason-badge";

type Reason = { text: string; type?: "mood_match" | "context_match" | "runtime_fit" | "style_match" };

type MovieCardProps = {
  title: string;
  score: number;
  reasons: Reason[];
  rank: number;
  primary?: boolean;
};

export function MovieCard({ title, score, reasons, rank, primary = false }: MovieCardProps) {
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
      <div className="mt-3 flex flex-wrap gap-2">
        {reasons.slice(0, 3).map((reason, idx) => (
          <ReasonBadge key={`${title}-${idx}`} type={reason.type ?? "mood_match"} text={reason.text} />
        ))}
      </div>
    </PopCard>
  );
}
