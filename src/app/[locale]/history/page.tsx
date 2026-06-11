import { getTranslations } from "next-intl/server";

import { getAppUser } from "@/lib/auth/app-user";
import { AvatarTrigger } from "@/components/account/avatar-trigger";
import { RecommendationHistorySection } from "@/components/mypage/recommendation-history-section";
import { PopCard } from "@/components/ui/pop-card";

export default async function HistoryPage() {
  const t = await getTranslations("mypage.history");
  const appUser = await getAppUser();

  return (
    <main className="mx-auto min-h-screen w-full max-w-xl px-6 py-10">
      <AvatarTrigger image={appUser.image} name={appUser.name} />
      <div className="mt-8 space-y-5">
        <PopCard tone="muted" className="space-y-2">
          <p className="text-heading">{t("eyebrow")}</p>
          <h1 className="text-movie-title">{t("title")}</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">{t("pageDescription")}</p>
        </PopCard>
        <RecommendationHistorySection variant="full" selfFetch />
      </div>
    </main>
  );
}
