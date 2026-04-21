"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { PopButton } from "@/components/ui/pop-button";
import { PopCard } from "@/components/ui/pop-card";
import { MoodChip } from "@/components/ui/mood-chip";
import { MBTI_TYPES, MOOD_TAGS } from "@/lib/constants/taxonomy";

type SwipeCandidate = {
  movieId: string;
  title: string;
  releaseYear: number | null;
  posterUrl: string;
  overview: string | null;
  genrePrimary: string | null;
  genreSecondary: string | null;
};

type MovieKnownDecision = {
  movieId: string;
  knownState: "known" | "unknown";
};

type DragState = {
  startX: number;
  startY: number;
  dx: number;
  dy: number;
  active: boolean;
};

const SWIPE_TARGET = 10;
const SWIPE_OUT_DISTANCE = 440;
const SWIPE_SETTLE_MS = 120;
const FLICK_VELOCITY_THRESHOLD = 0.75;
const FLICK_MIN_DISTANCE_PX = 52;
const TARGET_CONFIRM_PADDING_PX = 24;
function triggerLightHaptic() {
  if (typeof window === "undefined") return;
  const isMobileLike = navigator.maxTouchPoints > 0;
  if (!isMobileLike) return;
  if ("vibrate" in navigator) {
    navigator.vibrate(16);
  }
}

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [mbtiType, setMbtiType] = useState<string>("");
  const [preferredMoods, setPreferredMoods] = useState<string[]>([]);
  const [candidates, setCandidates] = useState<SwipeCandidate[]>([]);
  const [knownDecisions, setKnownDecisions] = useState<MovieKnownDecision[]>([]);
  const [knownRatings, setKnownRatings] = useState<Record<string, 1 | 2 | 3 | 4 | 5>>({});
  const [classifyIndex, setClassifyIndex] = useState(0);
  const [ratingIndex, setRatingIndex] = useState(0);
  const [drag, setDrag] = useState<DragState>({ startX: 0, startY: 0, dx: 0, dy: 0, active: false });
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [candidateError, setCandidateError] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [expandedOverviewByMovieId, setExpandedOverviewByMovieId] = useState<Record<string, boolean>>({});
  const [isSwipeSettling, setIsSwipeSettling] = useState(false);
  const [pendingSwipeDirection, setPendingSwipeDirection] = useState<"left" | "right" | null>(null);
  const [activeDropTarget, setActiveDropTarget] = useState<"left" | "right" | null>(null);
  const dragRef = useRef<DragState>({ startX: 0, startY: 0, dx: 0, dy: 0, active: false });
  const isSwipeSettlingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moveFrameRef = useRef<number | null>(null);
  const pendingMoveRef = useRef<{ drag: DragState; target: "left" | "right" | null } | null>(null);
  const velocityRef = useRef<{ lastDx: number; lastAt: number; velocityX: number }>({
    lastDx: 0,
    lastAt: 0,
    velocityX: 0,
  });
  const cardOriginCenterXRef = useRef<number | null>(null);
  const dropAreaRef = useRef<HTMLDivElement | null>(null);
  const leftTargetRef = useRef<HTMLDivElement | null>(null);
  const rightTargetRef = useRef<HTMLDivElement | null>(null);
  const progress = Math.round((step / 4) * 100);
  const classifyTarget = Math.max(SWIPE_TARGET, Math.min(14, candidates.length || SWIPE_TARGET));

  const currentClassifyMovie = candidates[classifyIndex] ?? null;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadingCandidates(true);
      setCandidateError("");
      const response = await fetch("/api/onboarding/swipe-candidates?limit=14", { cache: "no-store" });
      if (!response.ok) {
        if (!cancelled) {
          setCandidateError("映画候補の読み込みに失敗しました。時間をおいて再試行してください。");
          setLoadingCandidates(false);
        }
        return;
      }
      const data = (await response.json()) as { items?: SwipeCandidate[] };
      if (!cancelled) {
        setCandidates(data.items ?? []);
        setLoadingCandidates(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleMood = (mood: string) => {
    setPreferredMoods((prev) =>
      prev.includes(mood) ? prev.filter((item) => item !== mood) : prev.length < 5 ? [...prev, mood] : prev,
    );
  };

  const decidedMovieMap = useMemo(() => new Map(candidates.map((movie) => [movie.movieId, movie])), [candidates]);
  const knownMovieIds = useMemo(
    () => knownDecisions.filter((item) => item.knownState === "known").map((item) => item.movieId),
    [knownDecisions],
  );
  const moviesForRating = useMemo(
    () => knownMovieIds.map((id) => decidedMovieMap.get(id)).filter((movie): movie is SwipeCandidate => Boolean(movie)),
    [knownMovieIds, decidedMovieMap],
  );
  const currentRateMovie = moviesForRating[ratingIndex] ?? null;

  const commitRating = (rating: 1 | 2 | 3 | 4 | 5) => {
    if (!currentRateMovie) return;
    setKnownRatings((prev) => ({ ...prev, [currentRateMovie.movieId]: rating }));
    setRatingIndex((prev) => Math.min(prev + 1, Math.max(0, moviesForRating.length - 1)));
    setDrag({ startX: 0, startY: 0, dx: 0, dy: 0, active: false });
  };

  const resetDrag = () => {
    const next = { startX: 0, startY: 0, dx: 0, dy: 0, active: false };
    dragRef.current = next;
    setDrag(next);
    pointerIdRef.current = null;
    setActiveDropTarget(null);
    velocityRef.current = { lastDx: 0, lastAt: 0, velocityX: 0 };
    cardOriginCenterXRef.current = null;
    pendingMoveRef.current = null;
    if (moveFrameRef.current != null) {
      cancelAnimationFrame(moveFrameRef.current);
      moveFrameRef.current = null;
    }
  };

  const setSwipeSettlingState = (value: boolean) => {
    isSwipeSettlingRef.current = value;
    setIsSwipeSettling(value);
  };

  const clearSettleTimer = () => {
    if (!settleTimerRef.current) return;
    clearTimeout(settleTimerRef.current);
    settleTimerRef.current = null;
  };

  const finishKnownSwipe = (direction: "left" | "right") => {
    if (!currentClassifyMovie) {
      resetDrag();
      return;
    }
    triggerLightHaptic();
    const movieId = currentClassifyMovie.movieId;
    const knownState = direction === "right" ? "known" : "unknown";
    setSwipeSettlingState(true);
    setPendingSwipeDirection(direction);
    setActiveDropTarget(direction);
    const outDrag = direction === "right"
      ? { ...dragRef.current, dx: SWIPE_OUT_DISTANCE, dy: dragRef.current.dy, active: false }
      : { ...dragRef.current, dx: -SWIPE_OUT_DISTANCE, dy: dragRef.current.dy, active: false };
    dragRef.current = outDrag;
    setDrag(outDrag);

    clearSettleTimer();
    settleTimerRef.current = setTimeout(() => {
      setKnownDecisions((prev) => [...prev, { movieId, knownState }]);
      setClassifyIndex((prev) => Math.min(prev + 1, Math.max(0, candidates.length - 1)));
      setPendingSwipeDirection(null);
      setSwipeSettlingState(false);
      resetDrag();
    }, SWIPE_SETTLE_MS);
  };

  const resolveDropTargetFromOffset = (dx: number): "left" | "right" | null => {
    const baseCenterX = cardOriginCenterXRef.current;
    if (baseCenterX == null) return null;
    const currentCenterX = baseCenterX + dx;
    const leftRect = leftTargetRef.current?.getBoundingClientRect();
    const rightRect = rightTargetRef.current?.getBoundingClientRect();
    if (leftRect && currentCenterX <= leftRect.right + TARGET_CONFIRM_PADDING_PX) return "left";
    if (rightRect && currentCenterX >= rightRect.left - TARGET_CONFIRM_PADDING_PX) return "right";
    return null;
  };

  const finalizeSwipe = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return;
    if (!dragRef.current.active || isSwipeSettlingRef.current) return;
    const snapshot = dragRef.current;
    const target = activeDropTarget ?? resolveDropTargetFromOffset(snapshot.dx);
    if (target) {
      finishKnownSwipe(target);
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      return;
    }
    const velocityX = velocityRef.current.velocityX;
    if (Math.abs(velocityX) >= FLICK_VELOCITY_THRESHOLD && Math.abs(snapshot.dx) >= FLICK_MIN_DISTANCE_PX) {
      finishKnownSwipe(velocityX > 0 ? "right" : "left");
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      return;
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    resetDrag();
  };

  useEffect(
    () => () => {
      clearSettleTimer();
      if (moveFrameRef.current != null) {
        cancelAnimationFrame(moveFrameRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (typeof window === "undefined" || candidates.length === 0) return;
    const preloadUrls = [classifyIndex, classifyIndex + 1, classifyIndex + 2]
      .map((index) => candidates[index]?.posterUrl)
      .filter((url): url is string => Boolean(url));
    for (const url of preloadUrls) {
      const img = new window.Image();
      img.src = url;
    }
  }, [candidates, classifyIndex]);

  const handleCardPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isSwipeSettlingRef.current) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.preventDefault();
    pointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    const cardRect = event.currentTarget.getBoundingClientRect();
    cardOriginCenterXRef.current = cardRect.left + cardRect.width / 2;
    const next = {
      startX: event.clientX,
      startY: event.clientY,
      dx: 0,
      dy: 0,
      active: true,
    };
    dragRef.current = next;
    setDrag(next);
    velocityRef.current = { lastDx: 0, lastAt: performance.now(), velocityX: 0 };
  };

  const handleCardPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId || !dragRef.current.active || isSwipeSettlingRef.current) return;
    const now = performance.now();
    const prevVelocity = velocityRef.current;
    const next = {
      ...dragRef.current,
      dx: event.clientX - dragRef.current.startX,
      dy: event.clientY - dragRef.current.startY,
    };
    const dt = Math.max(1, now - prevVelocity.lastAt);
    const velocityX = (next.dx - prevVelocity.lastDx) / dt;
    velocityRef.current = { lastDx: next.dx, lastAt: now, velocityX };
    dragRef.current = next;
    pendingMoveRef.current = { drag: next, target: resolveDropTargetFromOffset(next.dx) };
    if (moveFrameRef.current == null) {
      moveFrameRef.current = requestAnimationFrame(() => {
        moveFrameRef.current = null;
        const pending = pendingMoveRef.current;
        if (!pending) return;
        setDrag(pending.drag);
        setActiveDropTarget(pending.target);
      });
    }
  };

  const handleClassifyPointerUp = (event: React.PointerEvent<HTMLDivElement>) => finalizeSwipe(event);
  const handleClassifyLostPointerCapture = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId || isSwipeSettlingRef.current) return;
    resetDrag();
  };

  const swipeStats = useMemo(() => {
    const known = knownDecisions.filter((event) => event.knownState === "known").length;
    const ratedHigh = knownMovieIds.filter((movieId) => (knownRatings[movieId] ?? 0) >= 4).length;
    return {
      known,
      ratedHigh,
      total: knownDecisions.length,
    };
  }, [knownDecisions, knownMovieIds, knownRatings]);

  const canGoRateStep = knownDecisions.length >= classifyTarget;
  const classifyProgress = Math.min(knownDecisions.length, classifyTarget);
  const canSubmit = knownMovieIds.every((movieId) => typeof knownRatings[movieId] === "number");
  const seenBadgeOpacity =
    pendingSwipeDirection === "right" || activeDropTarget === "right" ? 1 : Math.min(1, Math.max(0, drag.dx / 120));
  const neverSeenBadgeOpacity =
    pendingSwipeDirection === "left" || activeDropTarget === "left" ? 1 : Math.min(1, Math.max(0, -drag.dx / 120));

  const submit = async () => {
    setState("loading");
    setErrorMessage("");

    const swipeEvents = knownDecisions.map((decision) => {
      const rating = decision.knownState === "known" ? knownRatings[decision.movieId] ?? null : null;
      return {
        movieId: decision.movieId,
        knownState: decision.knownState,
        action: decision.knownState === "known" && (rating ?? 0) >= 4 ? "liked" : "skipped",
        rating,
        source: "onboarding" as const,
      };
    });

    const response = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mbtiType,
        preferredMoods,
        swipeEvents,
        onboardingVersion: 2,
      }),
    });

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setState("error");
      setErrorMessage(data.message ?? "入力を確認してください。");
      return;
    }

    router.push("/profile/taste");
    router.refresh();
  };

  const renderSwipeMovieCard = ({
    movie,
    interactive,
    className,
    style,
    imagePriority = false,
  }: {
    movie: SwipeCandidate;
    interactive: boolean;
    className?: string;
    style?: React.CSSProperties;
    imagePriority?: boolean;
  }) => {
    const isExpanded = expandedOverviewByMovieId[movie.movieId] ?? false;
    const hasLongOverview = (movie.overview?.length ?? 0) > 120;
    const overviewText = movie.overview ?? "あらすじは未登録です。";
    return (
      <div
        onPointerDown={interactive ? handleCardPointerDown : undefined}
        onPointerMove={interactive ? handleCardPointerMove : undefined}
        onPointerUp={interactive ? handleClassifyPointerUp : undefined}
        onPointerCancel={interactive ? handleClassifyPointerUp : undefined}
        onLostPointerCapture={interactive ? handleClassifyLostPointerCapture : undefined}
        className={`relative mx-auto w-full max-w-xl overflow-hidden rounded-[34px] border border-zinc-600/70 bg-zinc-950/95 p-5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] ${
          interactive ? "z-20 cursor-grab active:cursor-grabbing will-change-transform" : "pointer-events-none z-10"
        } ${className ?? ""}`.trim()}
        style={style}
      >
        <div className="pointer-events-none absolute inset-0 rounded-[34px] border border-zinc-400/15" />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-20 bg-gradient-to-b from-white/10 to-transparent" />
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-zinc-800">
          <Image
            src={movie.posterUrl}
            alt={`${movie.title} poster`}
            fill
            className="object-cover saturate-[0.9] contrast-110"
            sizes="(max-width: 768px) 92vw, (max-width: 1200px) 70vw, 720px"
            priority={imagePriority}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-zinc-950/70 to-transparent" />
        </div>
        <div className="grid min-h-[276px] grid-rows-[minmax(82px,auto)_1fr_24px] gap-3 px-1 pb-1 pt-5">
          <div>
            <h3 className="line-clamp-2 break-words text-[2.15rem] font-bold leading-[1.05] tracking-tight text-zinc-50">{movie.title}</h3>
            <p className="mt-1 text-[1rem] font-semibold text-zinc-300">{movie.releaseYear ? `(${movie.releaseYear})` : "\u00a0"}</p>
          </div>
          <div className="min-h-[154px]">
            <p className="text-[0.95rem] font-medium text-zinc-400">
              {[movie.genrePrimary, movie.genreSecondary].filter(Boolean).join(" / ") || "genre n/a"}
            </p>
            <p
              className={`mt-3 break-words text-[1.04rem] leading-8 text-zinc-200 ${
                isExpanded ? "max-h-36 overflow-y-auto pr-1" : "line-clamp-4 min-h-[128px]"
              }`}
            >
              {overviewText}
            </p>
          </div>
          <div className="h-6">
            {hasLongOverview ? (
              <button
                type="button"
                className="text-sm font-semibold text-pink-400 hover:text-pink-300"
                onClick={(event) => {
                  if (!interactive) return;
                  event.stopPropagation();
                  setExpandedOverviewByMovieId((prev) => ({
                    ...prev,
                    [movie.movieId]: !prev[movie.movieId],
                  }));
                }}
              >
                {isExpanded ? "閉じる" : "続きを読む"}
              </button>
            ) : (
              <span className="invisible text-sm font-semibold">続きを読む</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="mt-6 space-y-6">
      <PopCard tone="highlight" className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">3秒オンボーディング</p>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div className="h-full rounded-full bg-pink-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-zinc-500">Step {step} / 4</p>
      </PopCard>

      {step === 1 && (
        <PopCard tone="surface" className="space-y-4">
          <h2 className="text-base font-semibold">あなたのタイプを選択</h2>
          <div className="flex flex-wrap gap-2">
            {MBTI_TYPES.map((mbti) => (
              <MoodChip key={mbti} label={mbti} selected={mbtiType === mbti} onClick={() => setMbtiType(mbti)} />
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">今の気分 (1〜5個)</p>
            <div className="flex flex-wrap gap-2">
              {MOOD_TAGS.map((mood) => (
                <MoodChip key={mood} label={mood} selected={preferredMoods.includes(mood)} onClick={() => toggleMood(mood)} />
              ))}
            </div>
          </div>
          <PopButton className="w-full" disabled={!mbtiType || preferredMoods.length === 0} onClick={() => setStep(2)}>
            スワイプをはじめる
          </PopButton>
        </PopCard>
      )}

      {step === 2 && (
        <PopCard tone="surface" className="space-y-5 px-4 py-5 md:px-8 md:py-7">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-50">SWIPE ARENA</h2>
              <p className="mt-1 text-xs font-semibold tracking-[0.13em] text-zinc-500">LEFT: NEVER SEEN / RIGHT: SEEN</p>
            </div>
            <p className="rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1 text-xs font-semibold text-zinc-300">
              {classifyProgress}/{classifyTarget}
            </p>
          </div>
          {loadingCandidates && <p className="text-sm text-zinc-500">候補を読み込み中...</p>}
          {candidateError && <p className="text-sm text-rose-600">{candidateError}</p>}
          {!loadingCandidates && !candidateError && currentClassifyMovie && (
            <div ref={dropAreaRef} className="relative mx-auto w-full max-w-5xl py-5 md:py-6">
              <div className="grid grid-cols-[98px_minmax(0,1fr)_98px] items-stretch gap-3 md:grid-cols-[112px_minmax(0,1fr)_112px] md:gap-7">
                <div
                  ref={leftTargetRef}
                  className="pointer-events-none z-0 flex items-center justify-center rounded-3xl border border-fuchsia-400/55 bg-gradient-to-b from-fuchsia-700/35 to-fuchsia-950/15 transition-all"
                  style={{
                    opacity: activeDropTarget === "right" ? 0.42 : 0.96,
                    transform: `scale(${activeDropTarget === "left" ? 1.04 : 1})`,
                  }}
                >
                  <span className="rotate-[-90deg] text-xs font-extrabold tracking-[0.14em] text-fuchsia-200">NEVER SEEN</span>
                </div>
                <div className="relative">
                  <div
                    className="pointer-events-none absolute left-4 top-4 z-30 rounded-full border border-fuchsia-300/80 bg-fuchsia-500/85 px-3 py-1 text-xs font-extrabold tracking-wide text-white transition-opacity"
                    style={{
                      opacity: neverSeenBadgeOpacity,
                      transform: `scale(${1 + neverSeenBadgeOpacity * 0.14})`,
                      transformOrigin: "left top",
                      transition: drag.active ? "none" : "transform 110ms ease-out, opacity 110ms ease-out",
                    }}
                  >
                    NEVER SEEN
                  </div>
                  <div
                    className="pointer-events-none absolute right-4 top-4 z-30 rounded-full border border-emerald-300/80 bg-emerald-500/85 px-3 py-1 text-xs font-extrabold tracking-wide text-white transition-opacity"
                    style={{
                      opacity: seenBadgeOpacity,
                      transform: `scale(${1 + seenBadgeOpacity * 0.14})`,
                      transformOrigin: "right top",
                      transition: drag.active ? "none" : "transform 110ms ease-out, opacity 110ms ease-out",
                    }}
                  >
                    SEEN
                  </div>
                  {renderSwipeMovieCard({
                    movie: currentClassifyMovie,
                    interactive: true,
                    imagePriority: true,
                    className: "z-20 mx-auto max-w-2xl",
                    style: {
                      transform: `translate3d(${drag.dx}px, ${drag.dy}px, 0) rotate(${drag.dx * 0.021}deg) scale(${isSwipeSettling ? 0.995 : 1})`,
                      transition: drag.active ? "none" : "transform 95ms cubic-bezier(0.2, 0.72, 0.2, 1)",
                      touchAction: "none",
                      pointerEvents: isSwipeSettling ? "none" : "auto",
                    },
                  })}
                </div>
                <div
                  ref={rightTargetRef}
                  className="pointer-events-none z-0 flex items-center justify-center rounded-3xl border border-emerald-400/55 bg-gradient-to-b from-emerald-700/35 to-emerald-950/15 transition-all"
                  style={{
                    opacity: activeDropTarget === "left" ? 0.42 : 0.96,
                    transform: `scale(${activeDropTarget === "right" ? 1.04 : 1})`,
                  }}
                >
                  <span className="rotate-90 text-xs font-extrabold tracking-[0.14em] text-emerald-200">SEEN</span>
                </div>
              </div>
            </div>
          )}
          {!loadingCandidates && !candidateError && !currentClassifyMovie && (
            <p className="text-sm text-zinc-500">候補が尽きました。次へ進んで保存できます。</p>
          )}
          <div className="flex gap-2">
            <PopButton variant="ghost" className="flex-1" disabled={isSwipeSettling} onClick={() => setStep(1)}>
              戻る
            </PopButton>
            <PopButton className="flex-1" disabled={!canGoRateStep || isSwipeSettling} onClick={() => setStep(3)}>
              評価ステップへ ({classifyProgress}/{classifyTarget})
            </PopButton>
          </div>
        </PopCard>
      )}

      {step === 3 && (
        <PopCard tone="surface" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">知ってる作品を5段階ボタンで評価</h2>
            <p className="text-xs text-zinc-500">
              {Object.keys(knownRatings).length}/{knownMovieIds.length}
            </p>
          </div>
          <p className="text-xs text-zinc-500">下のボタンをタップして評価してください。</p>
          {knownMovieIds.length === 0 && (
            <p className="text-sm text-zinc-500">「知ってる」に振り分けた作品がないため、評価ステップはスキップできます。</p>
          )}
          {currentRateMovie && (
            <div className="space-y-3">
              <div className="rounded-3xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-zinc-800">
                  <Image
                    src={currentRateMovie.posterUrl}
                    alt={`${currentRateMovie.title} poster`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 90vw, 420px"
                  />
                </div>
                <div className="px-1 pb-2 pt-3">
                  <p className="text-lg font-bold">
                    {currentRateMovie.title}
                    {currentRateMovie.releaseYear ? ` (${currentRateMovie.releaseYear})` : ""}
                  </p>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                    この作品の満足度を選択してください
                  </p>
                  <p
                    className={`mt-2 text-sm text-zinc-600 dark:text-zinc-300 ${
                      expandedOverviewByMovieId[currentRateMovie.movieId] ? "" : "line-clamp-5"
                    }`}
                  >
                    {currentRateMovie.overview ?? "あらすじは未登録です。"}
                  </p>
                  {(currentRateMovie.overview?.length ?? 0) > 120 && (
                    <button
                      type="button"
                      className="mt-1 text-xs font-semibold text-pink-500 hover:text-pink-400"
                      onClick={(event) => {
                        event.stopPropagation();
                        setExpandedOverviewByMovieId((prev) => ({
                          ...prev,
                          [currentRateMovie.movieId]: !prev[currentRateMovie.movieId],
                        }));
                      }}
                    >
                      {expandedOverviewByMovieId[currentRateMovie.movieId] ? "閉じる" : "続きを読む"}
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[5, 4, 3, 2, 1].map((score) => (
                  <PopButton key={score} variant="ghost" className="w-full" onClick={() => commitRating(score as 1 | 2 | 3 | 4 | 5)}>
                    {score}
                  </PopButton>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <PopButton variant="ghost" className="flex-1" onClick={() => setStep(2)}>
              戻る
            </PopButton>
            <PopButton className="flex-1" disabled={!canSubmit} onClick={() => setStep(4)}>
              確認へ
            </PopButton>
          </div>
        </PopCard>
      )}

      {step === 4 && (
        <PopCard tone="surface" className="space-y-4">
          <h2 className="text-base font-semibold">最終確認</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p>MBTI: {mbtiType}</p>
            <p>ムード: {preferredMoods.length}件</p>
            <p>判定数: {swipeStats.total}件</p>
            <p>知ってる: {swipeStats.known}件</p>
            <p>高評価(4-5): {swipeStats.ratedHigh}件</p>
          </div>
          {state === "error" && <p className="text-sm text-rose-600">{errorMessage}</p>}
          <div className="flex gap-2">
            <PopButton variant="ghost" className="flex-1" onClick={() => setStep(3)}>
              戻る
            </PopButton>
            <PopButton className="flex-1" disabled={state === "loading"} onClick={() => void submit()}>
              {state === "loading" ? "保存中..." : "ワンタップで完了"}
            </PopButton>
          </div>
        </PopCard>
      )}
    </section>
  );
}
