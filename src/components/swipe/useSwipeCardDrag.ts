"use client";

import { useCallback, useRef, useState } from "react";

type SwipeDirection = "left" | "right" | "up";

export function useSwipeCardDrag({
  enabled,
  allowUpSwipe = false,
  threshold = 80,
  onExit,
}: {
  enabled: boolean;
  allowUpSwipe?: boolean;
  threshold?: number;
  onExit: (direction: SwipeDirection) => void;
}) {
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [exiting, setExiting] = useState<SwipeDirection | null>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const moved = useRef(false);
  const fired = useRef(false);

  const exit = useCallback(
    (direction: SwipeDirection) => {
      if (fired.current) return;
      fired.current = true;
      setExiting(direction);
      window.setTimeout(() => onExit(direction), 280);
    },
    [onExit],
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (!enabled || exiting) return;
    if (event.target instanceof HTMLElement && event.target.closest("button")) return;
    startX.current = event.clientX;
    startY.current = event.clientY;
    moved.current = false;
    setIsDragging(true);
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (!enabled || !isDragging || exiting) return;
    const nextX = event.clientX - startX.current;
    const nextY = event.clientY - startY.current;
    if (Math.abs(nextX) > 5 || Math.abs(nextY) > 5) moved.current = true;
    setDragX(nextX);
    setDragY(nextY);
  };

  const handlePointerUp = () => {
    if (!enabled || !isDragging) return;
    setIsDragging(false);
    if (!moved.current) {
      setDragX(0);
      setDragY(0);
      return;
    }
    if (dragX > threshold) exit("right");
    else if (dragX < -threshold) exit("left");
    else if (allowUpSwipe && dragY < -threshold) exit("up");
    else {
      setDragX(0);
      setDragY(0);
    }
  };

  const stopButtonPointer = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  return {
    dragX,
    dragY,
    isDragging,
    exiting,
    exit,
    stopButtonPointer,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
