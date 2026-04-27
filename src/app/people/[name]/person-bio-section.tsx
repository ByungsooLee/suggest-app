"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Props = {
  name: string;
  role: "director" | "actor";
  initialBio: string | null;
  initialAvatarUrl: string | null;
  hasCacheHit: boolean;
};

export function PersonBioSection({ name, role, initialBio, initialAvatarUrl, hasCacheHit }: Props) {
  const [bio, setBio] = useState<string | null>(initialBio);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [loading, setLoading] = useState(!hasCacheHit);

  useEffect(() => {
    if (hasCacheHit) return;
    fetch(`/api/people/${encodeURIComponent(name)}?role=${role}`)
      .then((r) => r.json())
      .then((data: { profile?: { bio?: string | null; avatarUrl?: string | null } }) => {
        setBio(data.profile?.bio ?? null);
        setAvatarUrl(data.profile?.avatarUrl ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [hasCacheHit, name, role]);

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="credits-section mb-10 flex flex-col items-center gap-4">
      {/* Avatar */}
      {avatarUrl ? (
        <div className="relative h-24 w-24 overflow-hidden rounded-full border border-[var(--color-border-accent)]">
          <Image src={avatarUrl} alt={name} fill className="object-cover" />
        </div>
      ) : (
        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
          <span className="credits-name text-xl">{initials}</span>
        </div>
      )}

      {/* Bio */}
      {loading ? (
        <p className="credits-label">プロフィールを取得中...</p>
      ) : bio ? (
        <p className="text-body mx-auto max-w-sm leading-relaxed">{bio}</p>
      ) : null}
    </div>
  );
}
