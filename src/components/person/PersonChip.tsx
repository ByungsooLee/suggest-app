"use client";

import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";

import { PersonBottomSheet } from "@/components/person/PersonBottomSheet";
import { PersonHoverCard } from "@/components/person/PersonHoverCard";
import { type PersonChipData, type PersonRole } from "@/components/person/types";
import { usePersonData } from "@/components/person/usePersonData";

const ROLE_ICON: Record<PersonRole, string> = {
  director: "🎬",
  actor: "🎭",
  writer: "✍️",
};

type Props = PersonChipData & {
  compact?: boolean;
};

export function PersonChip({ personId, tmdbId, name, role, displayName, compact = false }: Props) {
  const [isTouchLayout, setIsTouchLayout] = useState(false);
  const [hoverOpen, setHoverOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canOpenCard = Boolean(personId || typeof tmdbId === "number");

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setIsTouchLayout(!media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  const open = hoverOpen || sheetOpen;
  const { data, error, isLoading } = usePersonData({
    personId,
    tmdbId,
    role,
    enabled: open,
  });

  const label = displayName ?? name;
  const style = useMemo<CSSProperties>(() => ({
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    gap: compact ? "4px" : "6px",
    padding: compact ? "4px 8px" : "5px 10px",
    borderRadius: "999px",
    border: "1px solid rgba(232,227,216,0.15)",
    background: "rgba(232,227,216,0.04)",
    color: "rgba(240,237,232,0.9)",
    fontSize: compact ? "11px" : "12px",
    lineHeight: 1,
    cursor: canOpenCard ? "pointer" : "default",
    textDecoration: "none",
  }), [canOpenCard, compact]);

  const handleMouseEnter = () => {
    if (isTouchLayout || !canOpenCard) return;
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setHoverOpen(true);
  };

  const handleMouseLeave = () => {
    if (isTouchLayout || !canOpenCard) return;
    closeTimerRef.current = setTimeout(() => setHoverOpen(false), 120);
  };

  const handleClick = () => {
    if (!canOpenCard) return;
    setHoverOpen(false);
    setSheetOpen(true);
  };

  return (
    <span
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          handleClick();
        }}
        onFocus={() => !isTouchLayout && canOpenCard && setHoverOpen(true)}
        onBlur={() => !isTouchLayout && canOpenCard && setHoverOpen(false)}
        style={style}
      >
        <span aria-hidden="true">{ROLE_ICON[role]}</span>
        <span>{label}</span>
      </button>

      {hoverOpen && !isTouchLayout && (
        <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <PersonHoverCard
            name={name}
            role={role}
            data={data}
            error={error}
            isLoading={isLoading}
          />
        </div>
      )}

      <PersonBottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        name={name}
        role={role}
        data={data}
        error={error}
        isLoading={isLoading}
      />
    </span>
  );
}
