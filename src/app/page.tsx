import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { HomeMoodChips } from "@/components/home/HomeMoodChips";

export default async function Home() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user?.id);

  // Fetch personalized data for logged-in users
  let recentPosters: { id: string; title: string; posterUrl: string | null; movieId: string | null }[] = [];
  let stats: { total: number; thisMonth: number } | null = null;

  if (session?.user?.id) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [recent, total, thisMonth] = await Promise.all([
      prisma.userWatchedContent.findMany({
        where: { userId: session.user.id, contentType: "movie", posterUrl: { not: null } },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, title: true, posterUrl: true, movieId: true },
      }),
      prisma.userWatchedContent.count({
        where: { userId: session.user.id, contentType: "movie", watched: true },
      }),
      prisma.userWatchedContent.count({
        where: { userId: session.user.id, contentType: "movie", watched: true, watchedAt: { gte: startOfMonth } },
      }),
    ]);
    recentPosters = recent;
    stats = { total, thisMonth };
  }

  return (
    <main style={{ minHeight: "100vh", background: "#080808", paddingBottom: "96px" }}>
      {/* ── Hero ── */}
      <section
        style={{
          position: "relative", overflow: "hidden",
          padding: "clamp(40px, 10vw, 80px) 20px clamp(32px, 8vw, 60px)",
          minHeight: "60vh", display: "flex", alignItems: "center",
        }}
      >
        {/* ambient glow */}
        <div style={{
          pointerEvents: "none", position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(232,201,122,0.07) 0%, transparent 70%)",
        }} />
        <div style={{ position: "relative", maxWidth: "560px", margin: "0 auto", width: "100%" }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.14em", color: "rgba(232,201,122,0.6)", marginBottom: "16px" }}>
            MOVIE TONIGHT
          </p>
          <h1 style={{
            fontFamily: "var(--font-dm-serif)", fontSize: "clamp(2.2rem, 7vw, 3.6rem)",
            fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.1,
            color: "#f0ede8", marginBottom: "16px",
          }}>
            今夜の映画、<br />
            <span style={{ color: "#E8C97A" }}>3秒で決める。</span>
          </h1>
          <p style={{ fontSize: "15px", color: "rgba(240,237,232,0.5)", lineHeight: 1.65, marginBottom: "28px", maxWidth: "380px" }}>
            気分 × 誰と × MBTIで今夜の最適な1本を
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-start" }}>
            <Link
              href={isLoggedIn ? "/recommend" : "/login"}
              className="pulse-gold btn-bounce"
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "14px 28px", borderRadius: "12px",
                background: "#E8C97A", color: "#080808",
                fontWeight: 700, fontSize: "15px", letterSpacing: "0.04em",
                textDecoration: "none",
              }}
            >
              {isLoggedIn ? "今夜の1本を探す →" : "無料ではじめる →"}
            </Link>
            <p style={{ fontSize: "11px", color: "rgba(240,237,232,0.3)", letterSpacing: "0.06em" }}>
              4ステップ · 約1分
            </p>
          </div>
          {!isLoggedIn && (
            <p style={{ marginTop: "16px", fontSize: "13px", color: "rgba(240,237,232,0.4)" }}>
              すでにアカウントをお持ちの方は{" "}
              <Link href="/login" style={{ color: "#E8C97A", textDecoration: "none" }}>ログイン</Link>
            </p>
          )}
        </div>
      </section>

      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "0 20px" }}>
        {/* ── Quick mood chips ── */}
        <HomeMoodChips isLoggedIn={isLoggedIn} />

        {isLoggedIn ? (
          <>
            {/* ── あなたへのピック ── */}
            {recentPosters.length > 0 && (
              <section style={{ marginTop: "32px" }}>
                <p style={{ fontSize: "11px", letterSpacing: "0.1em", color: "rgba(240,237,232,0.35)", marginBottom: "12px" }}>
                  あなたへのピック
                </p>
                <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "6px", scrollbarWidth: "none" }}>
                  {recentPosters.map((item) => (
                    <Link
                      key={item.id}
                      href={item.movieId ? `/movies/${item.movieId}` : "#"}
                      style={{ flexShrink: 0, textDecoration: "none" }}
                    >
                      <div style={{
                        width: "72px", height: "108px", borderRadius: "8px",
                        overflow: "hidden", background: "#1a1a1a",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}>
                        {item.posterUrl && (
                          <img
                            src={item.posterUrl}
                            alt={item.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          />
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ── Stats ── */}
            {stats && stats.total > 0 && (
              <section style={{ marginTop: "28px" }}>
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px",
                }}>
                  <div style={{
                    padding: "14px 16px", borderRadius: "10px",
                    background: "rgba(240,237,232,0.03)", border: "1px solid rgba(240,237,232,0.06)",
                  }}>
                    <p style={{ fontSize: "11px", color: "rgba(240,237,232,0.35)", margin: "0 0 4px", letterSpacing: "0.08em" }}>
                      総視聴本数
                    </p>
                    <p style={{ fontFamily: "var(--font-dm-serif)", fontSize: "28px", color: "#E8C97A", margin: 0 }}>
                      {stats.total}
                      <span style={{ fontSize: "13px", color: "rgba(240,237,232,0.35)", marginLeft: "4px" }}>本</span>
                    </p>
                  </div>
                  <div style={{
                    padding: "14px 16px", borderRadius: "10px",
                    background: "rgba(240,237,232,0.03)", border: "1px solid rgba(240,237,232,0.06)",
                  }}>
                    <p style={{ fontSize: "11px", color: "rgba(240,237,232,0.35)", margin: "0 0 4px", letterSpacing: "0.08em" }}>
                      今月
                    </p>
                    <p style={{ fontFamily: "var(--font-dm-serif)", fontSize: "28px", color: "#f0ede8", margin: 0 }}>
                      {stats.thisMonth}
                      <span style={{ fontSize: "13px", color: "rgba(240,237,232,0.35)", marginLeft: "4px" }}>本</span>
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* ── MBTI shortcut ── */}
            <section style={{ marginTop: "20px" }}>
              <Link
                href="/mbti"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 16px", borderRadius: "10px", textDecoration: "none",
                  background: "rgba(232,201,122,0.05)", border: "1px solid rgba(232,201,122,0.15)",
                }}
              >
                <div>
                  <p style={{ fontSize: "11px", color: "rgba(232,201,122,0.5)", margin: "0 0 2px", letterSpacing: "0.08em" }}>
                    MBTI
                  </p>
                  <p style={{ fontSize: "14px", color: "#E8C97A", margin: 0, fontWeight: 500 }}>
                    一緒に観る人との相性チェック
                  </p>
                </div>
                <span style={{ color: "rgba(232,201,122,0.45)", fontSize: "16px" }}>→</span>
              </Link>
            </section>
          </>
        ) : (
          /* ── Non-logged-in feature badges ── */
          <section style={{ marginTop: "32px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { icon: "🎯", title: "気分ベースで提案", desc: "8種類の気分から今夜の映画を絞り込む" },
                { icon: "⚡", title: "4ステップ完結", desc: "質問に答えるだけで最適な1本が決まる" },
                { icon: "🧠", title: "MBTI×好みを学習", desc: "使うほど精度が上がるパーソナルエンジン" },
              ].map((f) => (
                <div key={f.title} style={{
                  display: "flex", gap: "14px", alignItems: "flex-start",
                  padding: "14px 16px", borderRadius: "10px",
                  background: "rgba(240,237,232,0.03)", border: "1px solid rgba(240,237,232,0.06)",
                }}>
                  <span style={{ fontSize: "20px", flexShrink: 0 }}>{f.icon}</span>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: "#f0ede8", margin: "0 0 2px" }}>{f.title}</p>
                    <p style={{ fontSize: "12px", color: "rgba(240,237,232,0.4)", margin: 0 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/login"
              style={{
                display: "block", marginTop: "20px", padding: "13px",
                borderRadius: "10px", background: "rgba(240,237,232,0.06)",
                border: "1px solid rgba(240,237,232,0.1)", textAlign: "center",
                color: "rgba(240,237,232,0.6)", fontSize: "14px", textDecoration: "none",
              }}
            >
              アカウントを作成してはじめる →
            </Link>
          </section>
        )}

        {/* ── Browse link ── */}
        <div style={{ marginTop: "32px", textAlign: "center" }}>
          <Link href="/browse" style={{ fontSize: "13px", color: "rgba(240,237,232,0.3)", textDecoration: "none", letterSpacing: "0.06em" }}>
            カタログを見る →
          </Link>
        </div>
      </div>
    </main>
  );
}
