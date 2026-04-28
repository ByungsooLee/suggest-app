import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const year = Number(req.nextUrl.searchParams.get("year") ?? new Date().getFullYear());
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);

  const logs = await prisma.watchLog.findMany({
    where: { userId: session.user.id, watchedAt: { gte: start, lt: end } },
    include: { movie: { select: { id: true, title: true, releaseYear: true, genrePrimary: true, posterUrl: true, directors: true } } },
    orderBy: { watchedAt: "desc" },
  });

  const totalCount = logs.length;
  const scored = logs.filter((l) => l.score != null);
  const avgScore = scored.length > 0 ? scored.reduce((s, l) => s + l.score!, 0) / scored.length : 0;

  const genreCount: Record<string, number> = {};
  for (const l of logs) genreCount[l.movie.genrePrimary] = (genreCount[l.movie.genrePrimary] ?? 0) + 1;
  const byGenre = Object.entries(genreCount)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count);
  const topGenre = byGenre[0]?.genre ?? "";

  const promptUsedCount = logs.filter((l) => l.promptUsed != null).length;

  const emotionCount: Record<string, number> = {};
  for (const l of logs) {
    if (l.emotion) emotionCount[l.emotion] = (emotionCount[l.emotion] ?? 0) + 1;
  }
  const byEmotion = Object.entries(emotionCount).map(([emotion, count]) => ({ emotion, count }));

  const monthCount: Record<number, number> = {};
  for (const l of logs) {
    const m = new Date(l.watchedAt).getMonth() + 1;
    monthCount[m] = (monthCount[m] ?? 0) + 1;
  }
  const byMonth = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, count: monthCount[i + 1] ?? 0 }));

  const recentLog = logs[0] ?? null;

  return NextResponse.json({
    totalCount,
    avgScore,
    topGenre,
    promptUsedCount,
    byGenre,
    byEmotion,
    byMonth,
    recentLog,
    logs,
  });
}
