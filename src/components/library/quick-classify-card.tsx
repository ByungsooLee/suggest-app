"use client";

import { useEffect, useRef, useState } from "react";

type QuickAction = "seen" | "not_seen" | "liked" | "not_for_me" | "skip";

type QuickCandidate = {
  movieId: string;
  title: string;
  releaseYear: number | null;
  posterUrl: string | null;
  overview: string | null;
  directors: string[];
  cast: string[];
  genrePrimary: string | null;
  strategyBucket: string;
};

type QuickClassifyCardProps = {
  candidate: QuickCandidate;
  disabled?: boolean;
  onAction: (action: QuickAction) => void;
};

function strategyBucketLabel(bucket: string) {
  if (bucket === "anchor") return "定番人気";
  if (bucket === "genre_diverse") return "ジャンル拡張";
  if (bucket === "era_diverse") return "年代拡張";
  if (bucket === "taste_adjacent") return "好み近傍";
  if (bucket === "boundary_test") return "境界探索";
  if (bucket === "exploratory") return "探索枠";
  return "候補";
}

export function QuickClassifyCard({ candidate, disabled = false, onAction }: QuickClassifyCardProps) {
  const pointerIdRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const [dx, setDx] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => {
      media.removeEventListener("change", onChange);
    };
  }, []);

  const finalize = (distance: number) => {
    if (Math.abs(distance) < 80) {
      setDx(0);
      return;
    }
    onAction(distance > 0 ? "seen" : "not_seen");
    setDx(0);
  };
  const dragIntensity = Math.min(1, Math.abs(dx) / 140);
  const leftActive = dx <= -72;
  const rightActive = dx >= 72;
  const settleStyle = reducedMotion
    ? {
        transform: `translateX(${dx}px)`,
        opacity: 1,
      }
    : {
        transform: `translateX(${dx}px) rotate(${dx * 0.03}deg) scale(${1 - dragIntensity * 0.02})`,
        opacity: 1 - dragIntensity * 0.06,
      };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 text-xs text-[var(--color-text-secondary)]">
        <div
          className={`rounded-[var(--radius-md)] border px-3 py-2 text-center transition ${
            leftActive
              ? "border-[var(--color-border-accent)] bg-[var(--color-accent-dim)] text-[var(--color-accent)]"
              : "border-[var(--color-border)] bg-[var(--color-bg-elevated)]"
          }`}
        >
          ← 未視聴
        </div>
        <div
          className={`rounded-[var(--radius-md)] border px-3 py-2 text-center transition ${
            rightActive
              ? "border-[var(--color-border-accent)] bg-[var(--color-accent-dim)] text-[var(--color-accent)]"
              : "border-[var(--color-border)] bg-[var(--color-bg-elevated)]"
          }`}
        >
          観た →
        </div>
      </div>
      <article
        onPointerDown={(event) => {
          if (disabled || event.button !== 0) return;
          pointerIdRef.current = event.pointerId;
          startRef.current = event.clientX;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (pointerIdRef.current !== event.pointerId) return;
          const nextDx = event.clientX - startRef.current;
          setDx(Math.max(-180, Math.min(180, nextDx)));
        }}
        onPointerUp={(event) => {
          if (pointerIdRef.current !== event.pointerId) return;
          finalize(event.clientX - startRef.current);
          pointerIdRef.current = null;
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={(event) => {
          if (pointerIdRef.current !== event.pointerId) return;
          setDx(0);
          pointerIdRef.current = null;
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-surface)]"
      >
        <div
          className="transition-[transform,opacity] duration-[250ms]"
          style={{
            ...settleStyle,
            transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={candidate.posterUrl ?? "/images/no-poster.svg"} alt={candidate.title} className="h-[430px] w-full object-cover" />
          <div className="space-y-2 p-4">
            <h3 className="text-lg font-[500]">
              {candidate.title}
              {candidate.releaseYear ? ` (${candidate.releaseYear})` : ""}
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {candidate.genrePrimary ?? "-"} · {strategyBucketLabel(candidate.strategyBucket)}
            </p>
            <p className="line-clamp-3 text-sm text-[var(--color-text-secondary)]">{candidate.overview ?? "概要は未登録です。"}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">監督: {candidate.directors.join(", ") || "-"}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">出演: {candidate.cast.join(", ") || "-"}</p>
          </div>
        </div>
      </article>
    </div>
  );
}
