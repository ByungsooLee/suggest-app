"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { PopButton } from "@/components/ui/pop-button";
import { PopCard } from "@/components/ui/pop-card";
import { MoodChip } from "@/components/ui/mood-chip";
import { MOOD_TAGS } from "@/lib/constants/taxonomy";

const artistPlaceholders = ["Favorite artist #1", "Favorite artist #2", "Favorite artist #3"];
const moviePlaceholders = ["Favorite movie #1", "Favorite movie #2", "Favorite movie #3"];

export function OnboardingForm() {
  const router = useRouter();
  const [favoriteArtists, setFavoriteArtists] = useState(["", "", ""]);
  const [favoriteMovies, setFavoriteMovies] = useState(["", "", ""]);
  const [preferredMoods, setPreferredMoods] = useState<string[]>([]);
  const [dislikedElements, setDislikedElements] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const toggleMood = (mood: string) => {
    setPreferredMoods((prev) =>
      prev.includes(mood) ? prev.filter((item) => item !== mood) : prev.length < 5 ? [...prev, mood] : prev,
    );
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState("loading");
    setErrorMessage("");

    const payload = {
      favoriteArtists: favoriteArtists.map((v) => v.trim()),
      favoriteMovies: favoriteMovies.map((v) => v.trim()),
      preferredMoods,
      dislikedElements: dislikedElements
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    };

    const response = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setState("error");
      setErrorMessage(data.message ?? "入力を確認してください。");
      return;
    }

    router.push("/profile/taste");
    router.refresh();
  };

  return (
    <form className="mt-6 space-y-6" onSubmit={submit}>
      <PopCard tone="surface" className="space-y-3">
        <h2 className="text-sm font-semibold">好きなアーティスト (3件)</h2>
        {artistPlaceholders.map((placeholder, idx) => (
          <input
            key={placeholder}
            value={favoriteArtists[idx]}
            onChange={(event) => {
              const next = [...favoriteArtists];
              next[idx] = event.target.value;
              setFavoriteArtists(next);
            }}
            required
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            placeholder={placeholder}
          />
        ))}
      </PopCard>

      <PopCard tone="surface" className="space-y-3">
        <h2 className="text-sm font-semibold">好きな映画 (3件)</h2>
        {moviePlaceholders.map((placeholder, idx) => (
          <input
            key={placeholder}
            value={favoriteMovies[idx]}
            onChange={(event) => {
              const next = [...favoriteMovies];
              next[idx] = event.target.value;
              setFavoriteMovies(next);
            }}
            required
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            placeholder={placeholder}
          />
        ))}
      </PopCard>

      <PopCard tone="highlight" className="space-y-3">
        <h2 className="text-sm font-semibold">今夜寄りのムード (1〜5)</h2>
        <div className="flex flex-wrap gap-2">
          {MOOD_TAGS.map((mood) => (
            <MoodChip key={mood} label={mood} selected={preferredMoods.includes(mood)} onClick={() => toggleMood(mood)} />
          ))}
        </div>
      </PopCard>

      <PopCard tone="muted" className="space-y-2">
        <h2 className="text-sm font-semibold">避けたい要素 (カンマ区切り)</h2>
        <input
          value={dislikedElements}
          onChange={(event) => setDislikedElements(event.target.value)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          placeholder="gore, too_dark"
        />
      </PopCard>

      {state === "error" && <p className="text-sm text-rose-600">{errorMessage}</p>}

      <PopButton type="submit" disabled={state === "loading"} className="w-full">
        {state === "loading" ? "保存中..." : "好みを保存してプロファイル生成"}
      </PopButton>
    </form>
  );
}
