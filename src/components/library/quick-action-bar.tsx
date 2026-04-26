"use client";

import { PopButton } from "@/components/ui/pop-button";

type QuickAction = "seen" | "not_seen" | "liked" | "not_for_me" | "skip";

type QuickActionBarProps = {
  disabled?: boolean;
  onAction: (action: QuickAction) => void;
};

export function QuickActionBar({ disabled = false, onAction }: QuickActionBarProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      <PopButton disabled={disabled} onClick={() => onAction("seen")}>
        観た
      </PopButton>
      <PopButton variant="secondary" disabled={disabled} onClick={() => onAction("not_seen")}>
        未視聴
      </PopButton>
      <PopButton variant="secondary" disabled={disabled} onClick={() => onAction("liked")}>
        好き
      </PopButton>
      <PopButton variant="secondary" disabled={disabled} onClick={() => onAction("not_for_me")}>
        合わない
      </PopButton>
      <PopButton variant="ghost" disabled={disabled} onClick={() => onAction("skip")}>
        スキップ
      </PopButton>
    </div>
  );
}
