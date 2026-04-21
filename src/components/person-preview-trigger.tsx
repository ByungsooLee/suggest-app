"use client";

import { useEffect, useRef, useState } from "react";

import { MoodChip } from "@/components/ui/mood-chip";

import { PersonPreviewCard } from "./person-preview-card";

type PersonRole = "director" | "actor";

type PersonPreviewTriggerProps = {
  name: string;
  count: number;
  role: PersonRole;
  selected: boolean;
  onSelect: () => void;
};

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

export function PersonPreviewTrigger({ name, count, role, selected, onSelect }: PersonPreviewTriggerProps) {
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
