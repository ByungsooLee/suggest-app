"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

import { AvatarFallback } from "@/components/account/avatar-fallback";

type AvatarTriggerProps = {
  href?: string;
  image?: string | null;
  name?: string | null;
};

export function AvatarTrigger({ href = "/mypage", image, name }: AvatarTriggerProps) {
  const t = useTranslations("common");

  return (
    <Link
      href={href}
      className="fixed right-4 top-4 z-30 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-overlay)] p-1 shadow-[0_10px_24px_rgba(0,0,0,0.22)] backdrop-blur hover:border-[var(--color-border-accent)]"
      aria-label={t("openMypage")}
    >
      {image ? (
        <Image
          src={image}
          alt={t("profileAvatarAlt")}
          width={40}
          height={40}
          className="h-10 w-10 rounded-full object-cover"
          unoptimized
        />
      ) : (
        <AvatarFallback name={name} />
      )}
    </Link>
  );
}
