"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

import { AvatarFallback } from "@/components/account/avatar-fallback";
import { PopButton } from "@/components/ui/pop-button";
import { PopCard } from "@/components/ui/pop-card";

import { type MeProfile } from "./types";

type ProfileSectionProps = {
  profile: MeProfile | null;
  onProfileSaved: (profile: MeProfile) => void;
};

export function ProfileSection({ profile, onProfileSaved }: ProfileSectionProps) {
  const t = useTranslations("mypage.profile");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState(profile?.name ?? "");
  const [imageInput, setImageInput] = useState(profile?.image ?? "");
  const [state, setState] = useState<"idle" | "saving" | "error" | "done">("idle");
  const [message, setMessage] = useState("");

  const submit = async () => {
    setState("saving");
    setMessage("");
    try {
      const response = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          image: imageInput.trim() || undefined,
        }),
      });
      const payload = (await response.json()) as { profile?: MeProfile; message?: string };
      if (!response.ok || !payload.profile) {
        throw new Error(payload.message ?? t("updateError"));
      }
      onProfileSaved(payload.profile);
      setName(payload.profile.name ?? "");
      setImageInput(payload.profile.image ?? "");
      setState("done");
      setMessage(t("saved"));
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : t("updateError"));
    }
  };

  const onUploadClick = () => {
    fileInputRef.current?.click();
  };

  const onSelectFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setState("error");
      setMessage(t("invalidImage"));
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setState("error");
      setMessage(t("imageTooLarge"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageInput(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <PopCard tone="surface" className="space-y-4">
      <div>
        <h2 className="text-movie-title text-[1.35rem]">{t("title")}</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">{t("description")}</p>
      </div>
      <div className="flex items-center gap-4">
        {imageInput ? (
          <Image src={imageInput} alt="profile avatar" width={72} height={72} className="h-[72px] w-[72px] rounded-full object-cover" unoptimized />
        ) : (
          <AvatarFallback name={name || profile?.name} className="h-[72px] w-[72px] text-lg" />
        )}
        <div className="space-y-2">
          <PopButton variant="secondary" onClick={onUploadClick}>
            {t("uploadImage")}
          </PopButton>
          <p className="text-xs text-[var(--color-text-secondary)]">{t("uploadHelp")}</p>
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={onSelectFile} className="hidden" />
      <label className="block space-y-1">
        <span className="text-xs text-[var(--color-text-secondary)]">{t("name")}</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm"
          placeholder={t("namePlaceholder")}
        />
      </label>
      <label className="block space-y-1">
        <span className="text-xs text-[var(--color-text-secondary)]">{t("imageUrl")}</span>
        <input
          value={imageInput}
          onChange={(event) => setImageInput(event.target.value)}
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm"
          placeholder="https://..."
        />
      </label>
      {profile?.email ? <p className="text-xs text-[var(--color-text-secondary)]">{t("loginEmail", { email: profile.email })}</p> : null}
      {message ? <p className={`text-sm ${state === "error" ? "text-rose-500" : "text-[var(--color-match-high)]"}`}>{message}</p> : null}
      <PopButton onClick={submit} disabled={state === "saving"}>
        {state === "saving" ? t("saving") : t("save")}
      </PopButton>
    </PopCard>
  );
}
