import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { auth } from "@/auth";
import { AvatarTrigger } from "@/components/account/avatar-trigger";

export default async function HistoryPage() {
  const t = await getTranslations("history");
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-xl px-6 py-10">
      <AvatarTrigger image={session.user.image} name={session.user.name} />
      <h1 className="text-2xl font-[500]">{t("title")} ({t("deferred")})</h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
        {t("description")}
      </p>
    </main>
  );
}
