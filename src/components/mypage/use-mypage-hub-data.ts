"use client";

import { useEffect, useState } from "react";

import type {
  MeProfile,
  PersonalStats,
  Preferences,
  RecommendationHistoryItem,
  TasteSummary,
  WatchedItem,
} from "@/components/mypage/types";

type ProfileResponse = { profile: MeProfile };
type PreferencesResponse = { preferences: Preferences };
type WatchedResponse = { items: WatchedItem[] };
type RecommendationHistoryResponse = { items: RecommendationHistoryItem[] };

type MovieProfileData = { totalSwipes: number; personalityLabel: string | null };

export function useMyPageHubData(messages: { loadError: string; tasteFallback: string }) {
  const [profile, setProfile] = useState<MeProfile | null>(null);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [watched, setWatched] = useState<WatchedItem[]>([]);
  const [history, setHistory] = useState<RecommendationHistoryItem[]>([]);
  const [stats, setStats] = useState<PersonalStats | null>(null);
  const [tasteSummary, setTasteSummary] = useState<TasteSummary | null>(null);
  const [movieProfile, setMovieProfile] = useState<MovieProfileData | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      setState("loading");
      setErrorMessage("");
      try {
        const [profileRes, prefsRes, watchedRes, statsRes, tasteRes, historyRes, movieProfileRes] = await Promise.all([
          fetch("/api/me/profile", { cache: "no-store" }),
          fetch("/api/me/preferences", { cache: "no-store" }),
          fetch("/api/me/watched?type=all", { cache: "no-store" }),
          fetch("/api/me/stats", { cache: "no-store" }),
          fetch("/api/me/taste-summary", { cache: "no-store" }),
          fetch("/api/me/recommendation-history", { cache: "no-store" }),
          fetch("/api/me/movie-profile", { cache: "no-store" }),
        ]);

        if (!profileRes.ok || !prefsRes.ok || !watchedRes.ok) {
          throw new Error(messages.loadError);
        }

        const profileData = (await profileRes.json()) as ProfileResponse;
        const prefsData = (await prefsRes.json()) as PreferencesResponse;
        const watchedData = (await watchedRes.json()) as WatchedResponse;
        const historyData = historyRes.ok ? ((await historyRes.json()) as RecommendationHistoryResponse) : { items: [] };
        const statsData = statsRes.ok
          ? ((await statsRes.json()) as PersonalStats)
          : {
              totals: {
                watchedCount: watchedData.items.length,
                watchlistCount: 0,
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
          : { summary: messages.tasteFallback, signals: [] };

        setProfile(profileData.profile);
        setPreferences(prefsData.preferences);
        setWatched(watchedData.items);
        setHistory(historyData.items);
        setStats(statsData);
        setTasteSummary(tasteData);
        if (movieProfileRes.ok) setMovieProfile((await movieProfileRes.json()) as MovieProfileData);
        setState("ready");
      } catch (error) {
        setState("error");
        setErrorMessage(error instanceof Error ? error.message : messages.loadError);
      }
    };

    void load();
  }, [messages.loadError, messages.tasteFallback]);

  return {
    profile,
    setProfile,
    preferences,
    setPreferences,
    watched,
    history,
    stats,
    tasteSummary,
    movieProfile,
    state,
    errorMessage,
  };
}
