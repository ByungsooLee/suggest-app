"use client";

import { useEffect, useState } from "react";

import { PopCard } from "@/components/ui/pop-card";
import { QuickActionBar } from "@/components/library/quick-action-bar";
import { QuickClassifyCard } from "@/components/library/quick-classify-card";

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

type QuickCandidateResponse = {
  items: QuickCandidate[];
  strategyMeta: {
    servedCount: number;
    excludedCount: number;
  };
  nextCursor: string | null;
};

export function QuickAddPanel() {
  const [items, setItems] = useState<QuickCandidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classifiedCount, setClassifiedCount] = useState(0);
  const [message, setMessage] = useState("");
  const [sessionToken] = useState(() => `quick_${crypto.randomUUID()}`);

  const current = items[currentIndex] ?? null;

  useEffect(() => {
    let cancelled = false;
    const loadInitial = async () => {
      const params = new URLSearchParams();
      params.set("limit", "16");
      const response = await fetch(`/api/me/library/quick-candidates?${params.toString()}`, { cache: "no-store" });
      if (cancelled) return;
      if (!response.ok) {
        setLoading(false);
        setMessage("候補取得に失敗しました。");
        return;
      }
      const payload = (await response.json()) as QuickCandidateResponse;
      if (cancelled) return;
      setItems(payload.items);
      setNextCursor(payload.nextCursor);
      setLoading(false);
    };
    void loadInitial();
    return () => {
      cancelled = true;
    };
  }, []);

  const submitAction = async (action: QuickAction) => {
    if (!current || saving) return;
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/me/library/quick-reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        events: [
          {
            movieId: current.movieId,
            action,
            shownAt: new Date().toISOString(),
            sessionToken,
          },
        ],
      }),
    });
    setSaving(false);
    if (!response.ok) {
      setMessage("保存に失敗しました。");
      return;
    }
    setClassifiedCount((prev) => prev + 1);
    setCurrentIndex((prev) => prev + 1);
  };

  useEffect(() => {
    if (loading || currentIndex < items.length - 3 || !nextCursor) return;
    let cancelled = false;
    const loadMore = async () => {
      const params = new URLSearchParams();
      params.set("limit", "16");
      params.set("cursor", nextCursor);
      const response = await fetch(`/api/me/library/quick-candidates?${params.toString()}`, { cache: "no-store" });
      if (!response.ok || cancelled) return;
      const payload = (await response.json()) as QuickCandidateResponse;
      if (cancelled) return;
      setItems((prev) => [...prev, ...payload.items]);
      setNextCursor(payload.nextCursor);
    };
    void loadMore();
    return () => {
      cancelled = true;
    };
  }, [currentIndex, items.length, loading, nextCursor]);

  return (
    <div className="space-y-4">
      <PopCard tone="surface" className="space-y-2">
        <p className="text-heading">Quick Classify</p>
        <h2 className="text-movie-title text-[1.3rem]">クイック分類</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          気軽にスワイプ/タップして、推薦学習シグナルを増やせます。完了は不要、好きなところで止められます。
        </p>
        <p className="text-xs text-[var(--color-text-secondary)]">分類済み: {classifiedCount} 件</p>
      </PopCard>

      {loading ? (
        <PopCard tone="surface">
          <p className="text-sm text-[var(--color-text-secondary)]">候補を準備しています...</p>
        </PopCard>
      ) : !current ? (
        <PopCard tone="surface" className="space-y-2">
          <p className="text-sm text-[var(--color-text-secondary)]">今は提示候補がありません。時間をおいて再試行してください。</p>
        </PopCard>
      ) : (
        <PopCard tone="highlight" className="space-y-4">
          <QuickClassifyCard candidate={current} disabled={saving} onAction={submitAction} />
          <QuickActionBar disabled={saving} onAction={submitAction} />
          {message ? <p className="text-xs text-[var(--color-text-secondary)]">{message}</p> : null}
        </PopCard>
      )}
    </div>
  );
}
