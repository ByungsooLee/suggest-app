// src/app/api/movies/[movieId]/like/route.ts
//
// POST   → いいね追加（既にあればスキップ、冪等）
// DELETE → いいね削除
// GET    → 件数 + 自分がいいねしているか

import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db/prisma";

type Params = { params: Promise<{ movieId: string }> };

// ── GET ──────────────────────────────────────────────────────────────────────
export async function GET(_req: Request, { params }: Params) {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;
  const { userId } = authResult;
  const { movieId } = await params;

  const [count, myLike] = await Promise.all([
    prisma.movieLike.count({ where: { movieId } }),
    prisma.movieLike.findUnique({
      where: { userId_movieId: { userId, movieId } },
      select: { id: true },
    }),
  ]);

  return Response.json({ count, liked: myLike !== null });
}

// ── POST（いいね追加） ────────────────────────────────────────────────────────
export async function POST(_req: Request, { params }: Params) {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;
  const { userId } = authResult;
  const { movieId } = await params;

  // 映画の存在確認
  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
    select: { id: true },
  });
  if (!movie) {
    return Response.json({ code: "MOVIE_NOT_FOUND" }, { status: 404 });
  }

  // upsert（冪等）
  await prisma.movieLike.upsert({
    where:  { userId_movieId: { userId, movieId } },
    create: { userId, movieId },
    update: {},  // 既存なら何もしない
  });

  const count = await prisma.movieLike.count({ where: { movieId } });
  return Response.json({ count, liked: true }, { status: 200 });
}

// ── DELETE（いいね解除） ──────────────────────────────────────────────────────
export async function DELETE(_req: Request, { params }: Params) {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;
  const { userId } = authResult;
  const { movieId } = await params;

  await prisma.movieLike.deleteMany({
    where: { userId, movieId },
  });

  const count = await prisma.movieLike.count({ where: { movieId } });
  return Response.json({ count, liked: false }, { status: 200 });
}
