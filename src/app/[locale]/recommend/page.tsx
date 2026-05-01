import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

import { auth } from "@/auth";
import { AvatarTrigger } from "@/components/account/avatar-trigger";
import { prisma } from "@/lib/db/prisma";
import { ScreenHeader } from "@/components/screen-header";
import { PopCard } from "@/components/ui/pop-card";
import { PopButton } from "@/components/ui/pop-button";

import { RecommendForm } from "./recommend-form";

export default async function RecommendPage() {
  const t = await getTranslations("recommend.page");
  const tGenres = await getTranslations("browsePage.genres");
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompletedAt: true, name: true, image: true },
  });
  if (!user?.onboardingCompletedAt) {
    redirect("/onboarding");
  }

  const profile = await prisma.userTasteProfile.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  const mypagePreferences = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      favoriteGenres: true,
      excludedGenres: true,
    },
  });
  const formatGenres = (genres?: string[] | null) => {
    if (!genres?.length) return null;
    return genres
      .map((genre) => {
        try {
          return tGenres(genre);
        } catch {
          return genre;
        }
      })
      .join(" / ");
  };
  const favoriteGenres = formatGenres(mypagePreferences?.favoriteGenres) ?? t("unset");
  const excludedGenres = formatGenres(mypagePreferences?.excludedGenres) ?? t("none");

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10">
      <AvatarTrigger image={user?.image} name={user?.name} />
      <ScreenHeader
        title={t("title")}
        description={t("description")}
      />
      <PopCard tone="muted" className="mt-4 space-y-2">
        <p className="text-label">{t("preferencesLabel")}</p>
        <p className="text-body">
          {t("favoriteGenres", { genres: favoriteGenres })}
        </p>
        <p className="text-body">
          {t("excludedGenres", { genres: excludedGenres })}
        </p>
        <p className="text-body">
          {t("preferencesNote")}
        </p>
        <Link href="/mypage" className="inline-block">
          <PopButton variant="secondary">{t("editPreferences")}</PopButton>
        </Link>
      </PopCard>
      {!profile ? (
        <PopCard tone="muted" className="mt-6">
          <p className="text-body">{t("missingProfile")}</p>
          <Link href="/onboarding" className="mt-3 inline-block">
            <PopButton variant="secondary">{t("backToOnboarding")}</PopButton>
          </Link>
        </PopCard>
      ) : (
        <RecommendForm />
      )}
    </main>
  );
}
