"use client";

import { useEffect, useState } from "react";

import { PersonalStatsSection } from "@/components/mypage/personal-stats-section";
import { RecommendationHistorySection } from "@/components/mypage/recommendation-history-section";
import { RecommendationPreferencesSection } from "@/components/mypage/recommendation-preferences-section";
import { ProfileSection } from "@/components/mypage/profile-section";
import { TasteSummarySection } from "@/components/mypage/taste-summary-section";
import {
  type MeProfile,
  type PersonalStats,
  type Preferences,
  type RecommendationHistoryItem,
  type TasteSummary,
  type WatchedItem,
  type WatchlistItem,
} from "@/components/mypage/types";
import { WatchedPreviewCarousel } from "@/components/mypage/watched-preview-carousel";
import { WatchlistSection } from "@/components/mypage/watchlist-section";
import { PopCard } from "@/components/ui/pop-card";

type ProfileResponse = { profile: MeProfile };
type PreferencesResponse = { preferences: Preferences };
type WatchedResponse = { items: WatchedItem[] };
type WatchlistResponse = { items: WatchlistItem[] };
type RecommendationHistoryResponse = { items: RecommendationHistoryItem[] };

export function MyPageHub() {
  const [profile, setProfile] = useState<MeProfile | null>(null);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [watched, setWatched] = useState<WatchedItem[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [history, setHistory] = useState<RecommendationHistoryItem[]>([]);
  const [stats, setStats] = useState<PersonalStats | null>(null);
  const [tasteSummary, setTasteSummary] = useState<TasteSummary | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      setState("loading");
      setErrorMessage("");
      try {
        const [profileRes, prefsRes, watchedRes, watchlistRes, statsRes, tasteRes, historyRes] = await Promise.all([
          fetch("/api/me/profile", { cache: "no-store" }),
          fetch("/api/me/preferences", { cache: "no-store" }),
          fetch("/api/me/watched?type=all", { cache: "no-store" }),
          fetch("/api/me/watchlist", { cache: "no-store" }),
          fetch("/api/me/stats", { cache: "no-store" }),
          fetch("/api/me/taste-summary", { cache: "no-store" }),
          fetch("/api/me/recommendation-history", { cache: "no-store" }),
        ]);
        if (!profileRes.ok || !prefsRes.ok || !watchedRes.ok) {
          throw new Error("My Pageデータの取得に失敗しました。");
        }
        const profileData = (await profileRes.json()) as ProfileResponse;
        const prefsData = (await prefsRes.json()) as PreferencesResponse;
        const watchedData = (await watchedRes.json()) as WatchedResponse;
        const watchlistData = watchlistRes.ok ? ((await watchlistRes.json()) as WatchlistResponse) : { items: [] };
        const historyData = historyRes.ok ? ((await historyRes.json()) as RecommendationHistoryResponse) : { items: [] };
        const statsData = statsRes.ok
          ? ((await statsRes.json()) as PersonalStats)
          : {
              totals: {
                watchedCount: watchedData.items.length,
                watchlistCount: watchlistData.items.length,
                moviesCount: watchedData.items.filter((item) => item.contentType === "movie").length,
                dramasCount: watchedData.items.filter((item) => item.contentType === "drama").length,
                watchedThisMonth: 0,
                averageRating: null,
              },
              topGenres: [],
              topDirectors: [],
              topActors: [],
            };
        const tasteData = tasteRes.ok
          ? ((await tasteRes.json()) as TasteSummary)
          : { summary: "視聴履歴が増えると、あなたの好みサマリを表示します。", signals: [] };
        setProfile(profileData.profile);
        setPreferences(prefsData.preferences);
        setWatched(watchedData.items);
        setWatchlist(watchlistData.items);
        setHistory(historyData.items);
        setStats(statsData);
        setTasteSummary(tasteData);
        setState("ready");
      } catch (error) {
        setState("error");
        setErrorMessage(error instanceof Error ? error.message : "My Pageデータの取得に失敗しました。");
      }
    };
    void load();
  }, []);

  if (state === "loading") {
    return (
      <PopCard tone="muted">
        <p className="text-sm text-[var(--color-text-secondary)]">My Pageを読み込み中...</p>
      </PopCard>
    );
  }

  if (state === "error") {
    return (
      <PopCard tone="muted">
        <p className="text-sm text-rose-500">{errorMessage}</p>
      </PopCard>
    );
  }

  return (
    <div className="space-y-5">
      <ProfileSection profile={profile} onProfileSaved={setProfile} />
      <WatchedPreviewCarousel items={watched} />
      <WatchlistSection
        items={watchlist}
        onAdded={(item) => setWatchlist((prev) => [item, ...prev])}
        onRemoved={(itemId) => setWatchlist((prev) => prev.filter((item) => item.id !== itemId))}
        onMovedToWatched={(itemId, item) => {
          setWatchlist((prev) => prev.filter((entry) => entry.id !== itemId));
          if (item) setWatched((prev) => [item, ...prev]);
        }}
      />
      <RecommendationHistorySection items={history} />
      <PersonalStatsSection stats={stats} />
      <TasteSummarySection tasteSummary={tasteSummary} />
      <RecommendationPreferencesSection initialPreferences={preferences} onSaved={setPreferences} />
    </div>
  );
}
