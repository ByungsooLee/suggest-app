import { Link } from "@/i18n/navigation";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AvatarTrigger } from "@/components/account/avatar-trigger";
import { AppLanguageSwitcher } from "@/components/LanguageSwitcher";
import { ScreenHeader } from "@/components/screen-header";
import { PopButton } from "@/components/ui/pop-button";
import { PopCard } from "@/components/ui/pop-card";
import { getTranslations } from "next-intl/server";
import { MyPageHub } from "./mypage-hub";

export default async function MyPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const t = await getTranslations("mypage");
  const settingsT = await getTranslations("mypage.settings");

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10">
      <AvatarTrigger image={session.user.image} name={session.user.name} />
      <ScreenHeader
        title={t("title")}
        description={t("description")}
      />
      <Link href="/" className="mt-3 inline-block">
        <PopButton variant="ghost">{t("backHome")}</PopButton>
      </Link>
      <PopCard tone="muted" className="mt-5 text-sm text-[var(--color-text-secondary)]">
        {t("helper")}
      </PopCard>
      <PopCard tone="surface" className="mt-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-label">{settingsT("title")}</p>
          <p className="text-body">{settingsT("language")}</p>
        </div>
        <AppLanguageSwitcher />
      </PopCard>
      <div className="mt-5">
        <MyPageHub />
      </div>
    </main>
  );
}
