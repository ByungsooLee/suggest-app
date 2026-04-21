"use client";

import { useEffect, useState } from "react";

import { PopCard } from "@/components/ui/pop-card";

type RankingItem = {
  name: string;
  count: number;
};

type RankingResponse = {
  watchedCount: number;
  threshold: number;
  unlocked: boolean;
  remainingCount: number;
  directors: RankingItem[];
  actors: RankingItem[];
};

export function RankingsGate() {
  const [data, setData] = useState<RankingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      const response = await fetch("/api/profile/rankings", { cache: "no-store" });
      if (!response.ok) {
        if (!cancelled) {
          setError("ランキング情報の読み込みに失敗しました。");
          setLoading(false);
        }
        return;
      }
      const next = (await response.json()) as RankingResponse;
      if (!cancelled) {
        setData(next);
        setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <PopCard tone="muted" className="mt-6 text-sm text-zinc-500">
        ランキング情報を読み込み中...
      </PopCard>
    );
  }

  if (error || !data) {
    return (
      <PopCard tone="muted" className="mt-6 text-sm text-rose-600">
        {error || "ランキングを表示できませんでした。"}
      </PopCard>
    );
  }

  return (
    <PopCard tone="surface" className="mt-6 space-y-4">
      <h2 className="text-lg font-semibold">監督 / 俳優ランキング</h2>
      {!data.unlocked && (
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          あと{data.remainingCount}件でランキング解放。現在は{data.watchedCount}件です。
        </p>
      )}
      {data.unlocked && (
        <div className="grid gap-4 md:grid-cols-2">
          <section>
            <h3 className="text-sm font-semibold">監督 TOP {data.directors.length}</h3>
            <ul className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-300">
              {data.directors.map((item, index) => (
                <li key={item.name}>
                  {index + 1}. {item.name} ({item.count})
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h3 className="text-sm font-semibold">俳優 TOP {data.actors.length}</h3>
            <ul className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-300">
              {data.actors.map((item, index) => (
                <li key={item.name}>
                  {index + 1}. {item.name} ({item.count})
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </PopCard>
  );
}
