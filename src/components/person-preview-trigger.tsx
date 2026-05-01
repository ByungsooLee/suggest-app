"use client";

import { useEffect, useRef, useState } from "react";

import { MoodChip } from "@/components/ui/mood-chip";

import { PersonPreviewCard } from "./person-preview-card";

type PersonRole = "director" | "actor" | "writer";

type PersonPreviewTriggerSingleProps = {
  name: string;
  count: number;
  role: PersonRole;
  selected: boolean;
  onSelect: () => void;
  names?: never;
  onAdd?: never;
  onRemove?: never;
};

type PersonPreviewTriggerMultiProps = {
  names: string[];
  role: PersonRole;
  onAdd: () => void;
  onRemove: (name: string) => void;
  name?: never;
  count?: never;
  selected?: never;
  onSelect?: never;
};

type PersonPreviewTriggerProps = PersonPreviewTriggerSingleProps | PersonPreviewTriggerMultiProps;

type PersonPreviewResponse = {
  profile: {
    name: string;
    role: PersonRole;
    avatarUrl: string | null;
    bio: string | null;
    knownFor: string[];
    news: Array<{
      title: string;
      source: string;
      publishedAt: string;
      url: string | null;
    }>;
    strictMatched?: boolean;
    matchStatus?: "verified" | "unverified";
    matchConfidence?: number | null;
    matchReason?: string | null;
  };
};

const hoverDelayMs = 250;
const longPressMs = 450;

export function PersonPreviewTrigger(props: PersonPreviewTriggerProps) {
  if (props.names !== undefined) {
    const { names, onAdd, onRemove } = props;
    return (
      <div className="flex flex-wrap gap-2 items-center">
        {names.map((n) => (
          <span
            key={n}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--color-accent-dim)] border border-[var(--color-accent-border)] text-xs text-[var(--color-accent)]"
          >
            {n}
            <button
              type="button"
              onClick={() => onRemove(n)}
              className="ml-0.5 opacity-60 hover:opacity-100 text-[10px] leading-none"
              aria-label={`${n}を削除`}
            >
              ✕
            </button>
          </span>
        ))}
        <button
          type="button"
          onClick={onAdd}
          className="px-2.5 py-1 rounded-full border border-dashed border-[var(--color-border-mid)] text-xs text-[var(--color-text-muted)] hover:border-[var(--color-accent-border)] hover:text-[var(--color-accent)] transition-colors"
        >
          ＋ 追加
        </button>
      </div>
    );
  }

  const { name, count, role, selected, onSelect } = props;
  return <PersonPreviewTriggerSingle name={name} count={count} role={role} selected={selected} onSelect={onSelect} />;
}

function PersonPreviewTriggerSingle({ name, count, role, selected, onSelect }: {
  name: string; count: number; role: PersonRole; selected: boolean; onSelect: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PersonPreviewResponse["profile"] | null>(null);
  const [isMobileLike, setIsMobileLike] = useState(false);

  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(hover: none), (pointer: coarse)");
    const update = () => setIsMobileLike(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, []);

  const clearTimers = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (longPressRef.current) clearTimeout(longPressRef.current);
    hoverTimerRef.current = null;
    longPressRef.current = null;
  };

  const loadProfile = async () => {
    if (data || loading) return;
    setLoading(true);
    setError(null);
    try {
      const encodedName = encodeURIComponent(name);
      const response = await fetch(`/api/people/${encodedName}?role=${role}`, { cache: "no-store" });
      if (!response.ok) throw new Error("人物詳細の取得に失敗しました。");
      const payload = (await response.json()) as PersonPreviewResponse;
      setData(payload.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "人物詳細の取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const openPreview = () => {
    setOpen(true);
    void loadProfile();
  };

  const handleClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    onSelect();
  };

  const handlePointerDown = (pointerType?: string) => {
    if (!isMobileLike && pointerType === "mouse") return;
    clearTimers();
    longPressRef.current = setTimeout(() => {
      suppressClickRef.current = true;
      openPreview();
    }, longPressMs);
  };

  const handlePointerUp = () => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    if (isMobileLike) return;
    clearTimers();
    hoverTimerRef.current = setTimeout(() => {
      openPreview();
    }, hoverDelayMs);
  };

  const handleMouseLeave = () => {
    if (isMobileLike) return;
    clearTimers();
    setOpen(false);
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onPointerDown={(event) => handlePointerDown(event.pointerType)}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <MoodChip label={`${name} (${count})`} selected={selected} onClick={handleClick} />

      {open && !isMobileLike ? (
        <div className="absolute left-0 top-full z-30 mt-2">
          <PersonPreviewCard data={data} loading={loading} error={error} />
        </div>
      ) : null}

      {open && isMobileLike ? (
        <div className="fixed inset-0 z-40 flex items-end bg-black/50 p-3" onClick={() => setOpen(false)}>
          <div onClick={(event) => event.stopPropagation()} className="w-full">
            <PersonPreviewCard data={data} loading={loading} error={error} mobile onClose={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
