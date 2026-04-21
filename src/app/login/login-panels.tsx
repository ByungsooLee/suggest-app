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
      <div className="inline-flex rounded-full bg-zinc-200 p-1 dark:bg-zinc-800">
        <button
          type="button"
          onClick={() => setTab("login")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${tab === "login" ? "bg-white text-zinc-900" : "text-zinc-500 dark:text-zinc-300"}`}
        >
          ログイン
        </button>
        <button
          type="button"
          onClick={() => setTab("register")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${tab === "register" ? "bg-white text-zinc-900" : "text-zinc-500 dark:text-zinc-300"}`}
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
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <input
              name="username"
              required
              placeholder="username"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <input
              name="password"
              type="password"
              required
              placeholder="password (min 8)"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
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
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <input
              name="email"
              type="email"
              required
              placeholder="email@example.com"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <input
              name="username"
              required
              placeholder="username"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <input
              name="password"
              type="password"
              required
              placeholder="password (min 8)"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
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
