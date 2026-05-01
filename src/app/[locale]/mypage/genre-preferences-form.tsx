"use client";

import { useEffect, useRef, useState } from "react";

import { PersonPreviewTrigger } from "@/components/person-preview-trigger";
import { PopButton } from "@/components/ui/pop-button";
import { PopCard } from "@/components/ui/pop-card";
import {
  GENRE_AXIS_GROUP_LABELS,
  GENRE_AXIS_GROUPS,
  GENRE_AXIS_LABELS,
  GENRE_AXIS_EXAMPLES,
  type GenreAxisGroup,
  type MovieGenreAxis,
} from "@/lib/constants/taxonomy";

// ── 型定義 ─────────────────────────────────────────────────────────────────

type DiscoveryMode = "focused" | "balanced" | "wide";

type PreferencesResponse = {
  preferences: {
    favoriteGenres:       string[];
    excludedGenres:       string[];
    favoriteGenreAxes:    string[];
    excludedGenreAxes:    string[];
    preferredDirectors:   string[];
    preferredActors:      string[];
    preferredWriters:     string[];
    discoveryMode:        DiscoveryMode;
  };
};

type SuggestionItem = {
  name: string;
  count: number;
  role: "director" | "actor" | "writer";
  encodedName: string;
};

type SuggestionsResponse = {
  genres:      string[];
  directors:   SuggestionItem[];
  actors:      SuggestionItem[];
  writers:     SuggestionItem[];   // API 側で追加が必要（暫定: 空配列でも動作）
  fallbackUsed: boolean;
};

// ── helpers ────────────────────────────────────────────────────────────────

const parseCsv = (value: string) =>
  Array.from(
    new Set(
      value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .filter((s) => !s.toLowerCase().startsWith("unknown ")),
    ),
  );

const setCsv = (values: string[]) => values.join(", ");

const toggleName = (source: string, name: string) => {
  const list = parseCsv(source);
  return list.includes(name)
    ? setCsv(list.filter((s) => s !== name))
    : setCsv([...list, name]);
};

const toggleAxisItem = <T extends string>(arr: T[], item: T): T[] =>
  arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item];

// ── PersonModal ────────────────────────────────────────────────────────────

type PersonRole = "director" | "actor" | "writer";

const MODAL_TITLES: Record<PersonRole, string> = {
  director: "推し監督を選ぶ",
  actor:    "推し俳優を選ぶ",
  writer:   "推し脚本家を選ぶ",
};

const MODAL_SUBS: Record<PersonRole, string> = {
  director: "好きな監督を複数選択できます",
  actor:    "好きな俳優を複数選択できます",
  writer:   "脚本で映画を選ぶ人向けの設定です",
};

type PersonModalProps = {
  role:        PersonRole;
  selected:    string[];
  suggestions: SuggestionItem[];
  onClose:     () => void;
  onToggle:    (name: string) => void;
};

function PersonModal({ role, selected, suggestions, onClose, onToggle }: PersonModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = query
    ? suggestions.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
    : suggestions;

  return (
    // オーバーレイ
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-xl mx-auto bg-[var(--color-bg-surface)] border-t border-x border-[var(--color-border)] rounded-t-[22px] max-h-[85vh] flex flex-col">

        {/* ヘッダー */}
        <div className="px-5 pt-5 pb-4 border-b border-[var(--color-border)] flex items-start justify-between flex-shrink-0">
          <div>
            <h2 className="font-[var(--font-display)] text-lg text-[var(--color-text-primary)]">
              {MODAL_TITLES[role]}
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              {MODAL_SUBS[role]}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm flex items-center justify-center flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* 検索 */}
        <div className="px-5 py-3 border-b border-[var(--color-border)] flex-shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="名前で検索..."
            className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none"
          />
        </div>

        {/* 候補リスト */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)] py-4 text-center">
              候補が見つかりません
            </p>
          ) : (
            filtered.map((person) => {
              const isSelected = selected.includes(person.name);
              return (
                <button
                  key={person.name}
                  type="button"
                  onClick={() => onToggle(person.name)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-[var(--color-accent-dim)] border-[var(--color-accent-border)]"
                      : "bg-[var(--color-bg-elevated)] border-[var(--color-border)] hover:border-[var(--color-border-mid)]"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-[500] flex-shrink-0 border ${
                      isSelected
                        ? "bg-[var(--color-accent-dim)] border-[var(--color-accent-border)] text-[var(--color-accent)]"
                        : "bg-[var(--color-bg-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]"
                    }`}
                  >
                    {person.name.slice(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-[500] text-[var(--color-text-primary)] truncate">
                      {person.name}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      関連作品 {person.count} 本
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs flex-shrink-0 ${
                      isSelected
                        ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-[var(--color-bg-void)]"
                        : "border-[var(--color-border-mid)]"
                    }`}
                  >
                    {isSelected ? "✓" : ""}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* 確定ボタン */}
        <div className="px-5 pb-6 pt-3 flex-shrink-0">
          <PopButton type="button" onClick={onClose} className="w-full">
            選択を確定する
          </PopButton>
        </div>
      </div>
    </div>
  );
}

// ── GenreAxisChip ──────────────────────────────────────────────────────────

type ChipState = "neutral" | "liked" | "disliked";

type GenreAxisChipProps = {
  axis:     MovieGenreAxis;
  state:    ChipState;
  onToggle: (axis: MovieGenreAxis) => void;
};

function GenreAxisChip({ axis, state, onToggle }: GenreAxisChipProps) {
  const label = GENRE_AXIS_LABELS[axis];
  const example = GENRE_AXIS_EXAMPLES[axis];

  const colorClass =
    state === "liked"
      ? "bg-[var(--color-accent-dim)] border-[var(--color-accent-border)] text-[var(--color-accent)]"
      : state === "disliked"
      ? "bg-[rgba(110,191,139,0.1)] border-[rgba(110,191,139,0.22)] text-[var(--color-match-high)]"
      : "bg-[var(--color-bg-elevated)] border-[var(--color-border-mid)] text-[var(--color-text-secondary)]";

  return (
    <button
      type="button"
      title={example ? `例：${example}` : undefined}
      onClick={() => onToggle(axis)}
      className={`px-3 py-1.5 rounded-full border text-xs transition-all ${colorClass}`}
    >
      {label}
    </button>
  );
}

// ── メインフォーム ─────────────────────────────────────────────────────────

export function GenrePreferencesForm() {
  // ジャンル軸
  const [favoriteGenreAxes, setFavoriteGenreAxes] = useState<MovieGenreAxis[]>([]);
  const [excludedGenreAxes, setExcludedGenreAxes] = useState<MovieGenreAxis[]>([]);
  const [activeGroup, setActiveGroup] = useState<GenreAxisGroup>("tone");

  // 人物
  const [preferredDirectors, setPreferredDirectors] = useState("");
  const [preferredActors,    setPreferredActors]    = useState("");
  const [preferredWriters,   setPreferredWriters]   = useState("");

  // モーダル
  const [modalRole, setModalRole] = useState<PersonRole | null>(null);

  // 提案の広がり
  const [discoveryMode, setDiscoveryMode] = useState<DiscoveryMode>("balanced");

  // 候補
  const [suggestions, setSuggestions] = useState<SuggestionsResponse | null>(null);

  // フォーム状態
  const [formState, setFormState] = useState<"loading" | "idle" | "saving" | "done" | "error">("loading");
  const [message,   setMessage]   = useState("");

  // ── ロード ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      try {
        const [prefRes, sugRes] = await Promise.all([
          fetch("/api/mypage/preferences",    { cache: "no-store" }),
          fetch("/api/mypage/suggestions",    { cache: "no-store" }),
        ]);

        if (!prefRes.ok) throw new Error("preferences load failed");
        const prefData = (await prefRes.json()) as PreferencesResponse;
        const p = prefData.preferences;

        setFavoriteGenreAxes((p.favoriteGenreAxes ?? []) as MovieGenreAxis[]);
        setExcludedGenreAxes((p.excludedGenreAxes ?? []) as MovieGenreAxis[]);
        setPreferredDirectors(p.preferredDirectors.join(", "));
        setPreferredActors(p.preferredActors.join(", "));
        setPreferredWriters((p.preferredWriters ?? []).join(", "));
        setDiscoveryMode(p.discoveryMode ?? "balanced");

        if (sugRes.ok) {
          const sugData = (await sugRes.json()) as SuggestionsResponse;
          setSuggestions(sugData);
        }

        setFormState("idle");
      } catch {
        setFormState("error");
        setMessage("設定の読み込みに失敗しました。");
      }
    };
    void load();
  }, []);

  // ── ジャンル軸トグル ────────────────────────────────────────────────────
  // 1タップ: liked → 2タップ: disliked → 3タップ: neutral

  const handleAxisToggle = (axis: MovieGenreAxis) => {
    if (favoriteGenreAxes.includes(axis)) {
      setFavoriteGenreAxes((prev) => prev.filter((v) => v !== axis));
      setExcludedGenreAxes((prev) => toggleAxisItem(prev, axis));
    } else if (excludedGenreAxes.includes(axis)) {
      setExcludedGenreAxes((prev) => prev.filter((v) => v !== axis));
    } else {
      setFavoriteGenreAxes((prev) => toggleAxisItem(prev, axis));
    }
  };

  const getAxisState = (axis: MovieGenreAxis): ChipState => {
    if (favoriteGenreAxes.includes(axis)) return "liked";
    if (excludedGenreAxes.includes(axis))  return "disliked";
    return "neutral";
  };

  // ── 人物トグル（モーダル経由） ──────────────────────────────────────────

  const handlePersonToggle = (role: PersonRole, name: string) => {
    if (role === "director") setPreferredDirectors((v) => toggleName(v, name));
    if (role === "actor")    setPreferredActors((v) => toggleName(v, name));
    if (role === "writer")   setPreferredWriters((v) => toggleName(v, name));
  };

  const getSelected = (role: PersonRole): string[] => {
    if (role === "director") return parseCsv(preferredDirectors);
    if (role === "actor")    return parseCsv(preferredActors);
    if (role === "writer")   return parseCsv(preferredWriters);
    return [];
  };

  const getSuggestions = (role: PersonRole): SuggestionItem[] => {
    if (!suggestions) return [];
    if (role === "director") return suggestions.directors;
    if (role === "actor")    return suggestions.actors;
    if (role === "writer")   return suggestions.writers ?? [];
    return [];
  };

  // ── 保存 ──────────────────────────────────────────────────────────────

  const save = async () => {
    setFormState("saving");
    setMessage("");
    try {
      const res = await fetch("/api/mypage/preferences", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          favoriteGenres:     [],           // VOD汎用ジャンルは軸から推論するため空でも可
          excludedGenres:     [],
          favoriteGenreAxes,
          excludedGenreAxes,
          preferredDirectors: parseCsv(preferredDirectors),
          preferredActors:    parseCsv(preferredActors),
          preferredWriters:   parseCsv(preferredWriters),
          discoveryMode,
          influenceStrength:       "balanced",
          recommendationStyleMode: "balanced",
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { message?: string };
        throw new Error(data.message ?? "保存に失敗しました。");
      }
      setFormState("done");
      setMessage("保存しました。次回推薦から反映されます。");
    } catch (err) {
      setFormState("error");
      setMessage(err instanceof Error ? err.message : "保存に失敗しました。");
    }
  };

  // ── ローディング ────────────────────────────────────────────────────────

  if (formState === "loading") {
    return (
      <PopCard tone="muted">
        <p className="text-sm text-[var(--color-text-secondary)]">設定を読み込み中...</p>
      </PopCard>
    );
  }

  // ── グループ名リスト ────────────────────────────────────────────────────

  const groups = Object.keys(GENRE_AXIS_GROUPS) as GenreAxisGroup[];

  // ── レンダリング ────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* ── ジャンル軸チューニング ────────────────────────────────────── */}
      <PopCard tone="surface" className="space-y-4">
        <div>
          <h2 className="text-sm font-[500] text-[var(--color-text-primary)] mb-1">
            ジャンル / スタイル
          </h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            タップで「好き」（ゴールド）、もう一度で「避けたい」（緑）、もう一度で解除
          </p>
        </div>

        {/* タブ */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {groups.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setActiveGroup(g)}
              className={`px-3 py-1.5 rounded-full border text-xs whitespace-nowrap transition-all flex-shrink-0 ${
                activeGroup === g
                  ? "bg-[var(--color-bg-elevated)] border-[var(--color-border-mid)] text-[var(--color-text-primary)]"
                  : "border-[var(--color-border)] text-[var(--color-text-muted)]"
              }`}
            >
              {GENRE_AXIS_GROUP_LABELS[g]}
            </button>
          ))}
        </div>

        {/* チップ */}
        <div className="flex flex-wrap gap-2">
          {GENRE_AXIS_GROUPS[activeGroup].map((axis) => (
            <GenreAxisChip
              key={axis}
              axis={axis}
              state={getAxisState(axis)}
              onToggle={handleAxisToggle}
            />
          ))}
        </div>

        {/* 例文 */}
        {GENRE_AXIS_EXAMPLES[GENRE_AXIS_GROUPS[activeGroup][0]] && (
          <p className="text-xs text-[var(--color-text-muted)]">
            例：{GENRE_AXIS_EXAMPLES[GENRE_AXIS_GROUPS[activeGroup][0]]}
          </p>
        )}
      </PopCard>

      {/* ── 提案の広がり ─────────────────────────────────────────────── */}
      <PopCard tone="highlight" className="space-y-3">
        <h2 className="text-sm font-[500]">提案の広がり</h2>
        <div className="grid grid-cols-3 gap-2">
          {(["focused", "balanced", "wide"] as const).map((mode) => {
            const labels: Record<DiscoveryMode, string> = {
              focused:  "絞る",
              balanced: "バランス",
              wide:     "広げる",
            };
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setDiscoveryMode(mode)}
                className={`rounded-[var(--radius-md)] px-3 py-2 text-xs font-[500] transition ${
                  discoveryMode === mode
                    ? "bg-[var(--color-accent-dim)] border border-[var(--color-accent-border)] text-[var(--color-accent)]"
                    : "bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-muted)]"
                }`}
              >
                {labels[mode]}
              </button>
            );
          })}
        </div>
      </PopCard>

      {/* ── 推し監督 ──────────────────────────────────────────────────── */}
      <PopCard tone="surface" className="space-y-3">
        <h2 className="text-sm font-[500]">推し監督</h2>
        <PersonPreviewTrigger
          names={parseCsv(preferredDirectors)}
          role="director"
          onAdd={() => setModalRole("director")}
          onRemove={(name) => setPreferredDirectors((v) => toggleName(v, name))}
        />
      </PopCard>

      {/* ── 推し俳優 ──────────────────────────────────────────────────── */}
      <PopCard tone="surface" className="space-y-3">
        <h2 className="text-sm font-[500]">推し俳優</h2>
        <PersonPreviewTrigger
          names={parseCsv(preferredActors)}
          role="actor"
          onAdd={() => setModalRole("actor")}
          onRemove={(name) => setPreferredActors((v) => toggleName(v, name))}
        />
      </PopCard>

      {/* ── 推し脚本家 ────────────────────────────────────────────────── */}
      <PopCard tone="surface" className="space-y-3">
        <h2 className="text-sm font-[500]">推し脚本家</h2>
        <p className="text-xs text-[var(--color-text-muted)]">
          脚本家の傾向は推薦スコアに加味されます。
        </p>
        <PersonPreviewTrigger
          names={parseCsv(preferredWriters)}
          role="writer"
          onAdd={() => setModalRole("writer")}
          onRemove={(name) => setPreferredWriters((v) => toggleName(v, name))}
        />
      </PopCard>

      {/* ── 保存フィードバック ────────────────────────────────────────── */}
      {message && (
        <p
          className={`text-sm ${
            formState === "error"
              ? "text-[var(--color-streaming)]"
              : "text-[var(--color-match-high)]"
          }`}
        >
          {message}
        </p>
      )}

      <PopButton
        type="button"
        onClick={save}
        disabled={formState === "saving"}
        className="w-full"
      >
        {formState === "saving" ? "保存中..." : "設定を保存する"}
      </PopButton>

      {/* ── 人物モーダル ─────────────────────────────────────────────── */}
      {modalRole !== null && (
        <PersonModal
          role={modalRole}
          selected={getSelected(modalRole)}
          suggestions={getSuggestions(modalRole)}
          onClose={() => setModalRole(null)}
          onToggle={(name) => handlePersonToggle(modalRole, name)}
        />
      )}
    </div>
  );
}
