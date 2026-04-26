import Image from "next/image";
import Link from "next/link";

import { AvatarFallback } from "@/components/account/avatar-fallback";

type AvatarTriggerProps = {
  href?: string;
  image?: string | null;
  name?: string | null;
};

export function AvatarTrigger({ href = "/mypage", image, name }: AvatarTriggerProps) {
  return (
    <Link
      href={href}
      className="fixed right-4 top-4 z-30 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-overlay)] p-1 shadow-[0_10px_24px_rgba(0,0,0,0.22)] backdrop-blur hover:border-[var(--color-border-accent)]"
      aria-label="マイページを開く"
    >
      {image ? (
        <Image
          src={image}
          alt="profile avatar"
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
