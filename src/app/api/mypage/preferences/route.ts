// src/app/api/mypage/preferences/route.ts
//
// 変更点まとめ:
//   GET  - preferredWriters / favoriteGenreAxes / excludedGenreAxes を返す
//   POST - 同フィールドを受け取り User テーブルに保存

import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db/prisma";
import { MyPagePreferencesSchema } from "@/lib/validation/schemas";

// ── GET ──────────────────────────────────────────────────────────────────────

export async function GET() {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;
  const { userId } = authResult;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      favoriteGenres:          true,
      excludedGenres:          true,
      // JSON カラム: schema に追加後に有効になる
      // favoriteGenreAxes は metadata JSON に入れるか、新カラムを追加するかを選択する。
      // ここでは User.metadata (Json?) に格納する方式を採用し、
      // preferredWriters は String[] カラムとして追加する方式とする。
      preferredDirectors:      true,
      preferredActors:         true,
      preferredWriters:        true,  // migration 後に有効
      discoveryMode:           true,
      useFavoritesInRecommendations: true,
      preferenceInfluenceStrength:   true,
      recommendationStyleMode:       true,
      metadata:                true,  // favoriteGenreAxes / excludedGenreAxes を格納
    },
  });

  if (!user) {
    return Response.json({ code: "NOT_FOUND" }, { status: 404 });
  }

  // metadata から genreAxes を読み出す
  const meta = (user.metadata ?? {}) as Record<string, unknown>;
  const favoriteGenreAxes = Array.isArray(meta.favoriteGenreAxes)
    ? (meta.favoriteGenreAxes as string[])
    : [];
  const excludedGenreAxes = Array.isArray(meta.excludedGenreAxes)
    ? (meta.excludedGenreAxes as string[])
    : [];

  return Response.json({
    preferences: {
      favoriteGenres:          user.favoriteGenres,
      excludedGenres:          user.excludedGenres,
      favoriteGenreAxes,
      excludedGenreAxes,
      preferredDirectors:      user.preferredDirectors,
      preferredActors:         user.preferredActors,
      preferredWriters:        user.preferredWriters ?? [],
      discoveryMode:           user.discoveryMode ?? "balanced",
      influenceStrength:       user.preferenceInfluenceStrength ?? "balanced",
      recommendationStyleMode: user.recommendationStyleMode ?? "balanced",
    },
  });
}

// ── POST ─────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;
  const { userId } = authResult;

  const body: unknown = await request.json();
  const parsed = MyPagePreferencesSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { code: "VALIDATION_ERROR", errors: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const {
    favoriteGenres,
    excludedGenres,
    favoriteGenreAxes,
    excludedGenreAxes,
    preferredDirectors,
    preferredActors,
    preferredWriters,
    discoveryMode,
    influenceStrength,
    recommendationStyleMode,
  } = parsed.data;

  // genreAxes は metadata JSON に保存
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { metadata: true },
  });
  const existingMeta = (existingUser?.metadata ?? {}) as Record<string, unknown>;
  const updatedMeta = {
    ...existingMeta,
    favoriteGenreAxes,
    excludedGenreAxes,
  };

  await prisma.user.update({
    where: { id: userId },
    data: {
      favoriteGenres,
      excludedGenres,
      preferredDirectors,
      preferredActors,
      preferredWriters,
      discoveryMode,
      preferenceInfluenceStrength: influenceStrength,
      recommendationStyleMode,
      metadata: updatedMeta,
    },
  });

  return Response.json({ ok: true });
}
