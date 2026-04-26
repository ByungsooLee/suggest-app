"use client";

import { useState } from "react";

import { PopButton } from "@/components/ui/pop-button";
import { PopCard } from "@/components/ui/pop-card";

type LoginPanelsProps = {
  loginAction: (formData: FormData) => Promise<void>;
  registerAction: (formData: FormData) => Promise<void>;
};

export function LoginPanels({ loginAction, registerAction }: LoginPanelsProps) {
  const [tab, setTab] = useState<"login" | "register">("login");

  return (
    <section className="mt-6 space-y-4">
      <div className="inline-flex rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-1">
        <button
          type="button"
          onClick={() => setTab("login")}
          className={`rounded-[var(--radius-full)] px-4 py-1.5 text-xs font-[500] transition ${
            tab === "login"
              ? "bg-[var(--color-accent-dim)] text-[var(--color-accent)]"
              : "text-[var(--color-text-secondary)]"
          }`}
        >
          ログイン
        </button>
        <button
          type="button"
          onClick={() => setTab("register")}
          className={`rounded-[var(--radius-full)] px-4 py-1.5 text-xs font-[500] transition ${
            tab === "register"
              ? "bg-[var(--color-accent-dim)] text-[var(--color-accent)]"
              : "text-[var(--color-text-secondary)]"
          }`}
        >
          新規登録
        </button>
      </div>

      {tab === "login" ? (
        <PopCard tone="surface">
          <form action={loginAction} className="space-y-3">
            <input
              name="email"
              type="email"
              required
              placeholder="email@example.com"
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
            />
            <input
              name="username"
              required
              placeholder="username"
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
            />
            <input
              name="password"
              type="password"
              required
              placeholder="password (min 8)"
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
            />
            <PopButton type="submit" variant="primary" className="w-full">
              ログインして続ける
            </PopButton>
          </form>
        </PopCard>
      ) : (
        <PopCard tone="highlight">
          <form action={registerAction} className="space-y-3">
            <input
              name="name"
              required
              placeholder="表示名"
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
            />
            <input
              name="email"
              type="email"
              required
              placeholder="email@example.com"
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
            />
            <input
              name="username"
              required
              placeholder="username"
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
            />
            <input
              name="password"
              type="password"
              required
              placeholder="password (min 8)"
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
            />
            <PopButton type="submit" variant="secondary" className="w-full">
              登録してオンボーディングへ
            </PopButton>
          </form>
        </PopCard>
      )}
    </section>
  );
}
