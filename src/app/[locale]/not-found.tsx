import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

import { PopButton } from "@/components/ui/pop-button";
import { PopCard } from "@/components/ui/pop-card";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
      <PopCard tone="muted" className="space-y-4">
        <h1 className="text-2xl font-[500]">{t("title")}</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {t("description")}
        </p>
        <Link href="/">
          <PopButton variant="primary">{t("home")}</PopButton>
        </Link>
      </PopCard>
    </main>
  );
}
