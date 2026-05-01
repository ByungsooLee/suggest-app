"use client";

// src/components/movie/MovieSocialActions.tsx
//
// 参照UI（FilmCafe）と同じ縦アクションバー。
// いいね・コメントのみ。保存は詳細画面下部「後で見る」ボタンに集約。
// 楽観的更新：ボタン押下で即座にUIを更新し、バックグラウンドでAPI送信。

import { useCallback, useEffect, useState } from "react";

// ── 型 ─────────────────────────────────────────────────────────────────────

type Comment = {
  id: string;
  body: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
};

type Props = {
  movieId:    string;
  movieTitle: string;
};

// ── アイコン ────────────────────────────────────────────────────────────────

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

// ── コメントドロワー ────────────────────────────────────────────────────────

type CommentDrawerProps = {
  movieId:    string;
  movieTitle: string;
  count:      number;
  onClose:    () => void;
  onCountChange: (n: number) => void;
};

function CommentDrawer({ movieId, movieTitle, count, onClose, onCountChange }: CommentDrawerProps) {
  const [comments,  setComments]  = useState<Comment[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [draft,     setDraft]     = useState("");
  const [posting,   setPosting]   = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/movies/${movieId}/comments`);
        if (!res.ok) return;
        const data = (await res.json()) as { comments: Comment[]; count: number };
        setComments(data.comments);
        onCountChange(data.count);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [movieId, onCountChange]);

  const submit = async () => {
    const body = draft.trim();
    if (!body || posting) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/movies/${movieId}/comments`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ body }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { comment: Comment };
      setComments((prev) => [data.comment, ...prev]);
      onCountChange(count + 1);
      setDraft("");
    } finally {
      setPosting(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        display: "flex", alignItems: "flex-end",
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: "100%", maxWidth: 480, margin: "0 auto",
        background: "#111", borderRadius: "20px 20px 0 0",
        border: "0.5px solid rgba(255,255,255,0.1)",
        maxHeight: "75vh", display: "flex", flexDirection: "column",
      }}>
        {/* ヘッダー */}
        <div style={{
          padding: "16px 16px 12px",
          borderBottom: "0.5px solid rgba(255,255,255,0.07)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexShrink: 0,
        }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: "#F0EDE8" }}>{movieTitle}</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
              コメント {count}件
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "rgba(255,255,255,0.07)",
              border: "0.5px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.5)", fontSize: 14, cursor: "pointer",
            }}
          >✕</button>
        </div>

        {/* コメント一覧 */}
        <div style={{ overflowY: "auto", flex: 1, padding: "12px 16px" }}>
          {loading ? (
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "20px 0" }}>
              読み込み中...
            </p>
          ) : comments.length === 0 ? (
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textAlign: "center", padding: "20px 0" }}>
              まだコメントがありません。最初のコメントを残しましょう。
            </p>
          ) : (
            comments.map((c) => (
              <div key={c.id} style={{ marginBottom: 14, display: "flex", gap: 10 }}>
                {/* アバター */}
                <div style={{
                  width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                  background: "rgba(232,201,122,0.15)",
                  border: "0.5px solid rgba(232,201,122,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, color: "#E8C97A", fontWeight: 500,
                }}>
                  {(c.user.name ?? c.user.username ?? "?").slice(0, 1)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>
                      {c.user.name ?? c.user.username ?? "匿名"}
                    </span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
                      {formatDate(c.createdAt)}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>
                    {c.body}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 投稿フォーム */}
        <div style={{
          padding: "10px 14px 20px",
          borderTop: "0.5px solid rgba(255,255,255,0.07)",
          display: "flex", gap: 8, flexShrink: 0,
        }}>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void submit(); } }}
            placeholder="コメントを書く..."
            maxLength={500}
            style={{
              flex: 1, background: "rgba(255,255,255,0.06)",
              border: "0.5px solid rgba(255,255,255,0.12)",
              borderRadius: 10, padding: "9px 12px",
              fontSize: 13, color: "#F0EDE8",
              outline: "none",
            }}
          />
          <button
            onClick={() => void submit()}
            disabled={!draft.trim() || posting}
            style={{
              padding: "9px 14px", borderRadius: 10,
              background: draft.trim() ? "#E8C97A" : "rgba(255,255,255,0.06)",
              border: "none",
              color: draft.trim() ? "#080808" : "rgba(255,255,255,0.25)",
              fontSize: 13, fontWeight: 500, cursor: draft.trim() ? "pointer" : "default",
              transition: "all 0.15s",
            }}
          >
            {posting ? "..." : "送信"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── メインコンポーネント ────────────────────────────────────────────────────

export function MovieSocialActions({ movieId, movieTitle }: Props) {
  const [likeCount,    setLikeCount]    = useState(0);
  const [liked,        setLiked]        = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [likeLoading,  setLikeLoading]  = useState(false);

  // 初期データ取得
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/movies/${movieId}/like`);
        if (!res.ok) return;
        const data = (await res.json()) as { count: number; liked: boolean };
        setLikeCount(data.count);
        setLiked(data.liked);
      } catch {
        // サイレント失敗
      }
    };
    void load();
  }, [movieId]);

  // いいねトグル（楽観的更新）
  const toggleLike = useCallback(async () => {
    if (likeLoading) return;
    setLikeLoading(true);

    // 楽観的更新
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((n) => n + (newLiked ? 1 : -1));

    try {
      const res = await fetch(`/api/movies/${movieId}/like`, {
        method: newLiked ? "POST" : "DELETE",
      });
      if (res.ok) {
        const data = (await res.json()) as { count: number; liked: boolean };
        // サーバー値で上書き（ズレ補正）
        setLikeCount(data.count);
        setLiked(data.liked);
      } else {
        // ロールバック
        setLiked(!newLiked);
        setLikeCount((n) => n + (newLiked ? -1 : 1));
      }
    } catch {
      // ロールバック
      setLiked(!newLiked);
      setLikeCount((n) => n + (newLiked ? -1 : 1));
    } finally {
      setLikeLoading(false);
    }
  }, [liked, likeLoading, movieId]);

  return (
    <>
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: 18,
      }}>
        {/* いいね */}
        <button
          onClick={() => void toggleLike()}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            background: "none", border: "none", cursor: "pointer",
            color: liked ? "#E8C97A" : "rgba(255,255,255,0.8)",
            transition: "all 0.15s",
            transform: liked ? "scale(1.1)" : "scale(1)",
          }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: liked ? "rgba(232,201,122,0.15)" : "rgba(0,0,0,0.3)",
            backdropFilter: "blur(8px)",
            border: liked
              ? "0.5px solid rgba(232,201,122,0.3)"
              : "0.5px solid rgba(255,255,255,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <HeartIcon filled={liked} />
          </div>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
            {likeCount > 0 ? likeCount.toLocaleString() : ""}
          </span>
        </button>

        {/* コメント */}
        <button
          onClick={() => setShowComments(true)}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(255,255,255,0.8)",
          }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "rgba(0,0,0,0.3)", backdropFilter: "blur(8px)",
            border: "0.5px solid rgba(255,255,255,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <CommentIcon />
          </div>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
            {commentCount > 0 ? commentCount : ""}
          </span>
        </button>

      </div>

      {/* コメントドロワー */}
      {showComments && (
        <CommentDrawer
          movieId={movieId}
          movieTitle={movieTitle}
          count={commentCount}
          onClose={() => setShowComments(false)}
          onCountChange={setCommentCount}
        />
      )}
    </>
  );
}
