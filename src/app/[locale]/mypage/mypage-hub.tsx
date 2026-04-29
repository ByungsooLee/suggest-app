"use client";

import { useTranslations } from "next-intl";

import { MyPageShortcutLinks } from "@/components/mypage/MyPageShortcutLinks";
import { PersonalStatsSection } from "@/components/mypage/personal-stats-section";
import { RecommendationHistorySection } from "@/components/mypage/recommendation-history-section";
import { RecommendationPreferencesSection } from "@/components/mypage/recommendation-preferences-section";
import { ProfileSection } from "@/components/mypage/profile-section";
import { TasteSummarySection } from "@/components/mypage/taste-summary-section";
import { WatchedPreviewCarousel } from "@/components/mypage/watched-preview-carousel";
import { useMyPageHubData } from "@/components/mypage/use-mypage-hub-data";
import { PopCard } from "@/components/ui/pop-card";

export function MyPageHub() {
  const t = useTranslations("mypage");
  const {
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
  } = useMyPageHubData({
    loadError: t("loadError"),
    tasteFallback: "視聴履歴が増えると、あなたの好みサマリを表示します。",
  });

  if (state === "loading") {
    return (
      <PopCard tone="muted">
        <p className="text-sm text-[var(--color-text-secondary)]">{t("loading")}</p>
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
      <MyPageShortcutLinks
        movieProfile={movieProfile}
        mbtiLabel={t("mbtiCheck")}
        personalityProgressLabel={(remaining) => t("personality.progress", { remaining })}
      />
      <WatchedPreviewCarousel items={watched} />
      <RecommendationHistorySection items={history} />
      <PersonalStatsSection stats={stats} />
      <TasteSummarySection tasteSummary={tasteSummary} />
      <RecommendationPreferencesSection initialPreferences={preferences} onSaved={setPreferences} />
    </div>
  );
}
