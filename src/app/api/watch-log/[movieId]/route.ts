import { NextRequest, NextResponse } from "next/server";
import { getAppUserId } from "@/lib/auth/app-user";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ movieId: string }> },
) {
  const userId = await getAppUserId();
  const { movieId } = await params;
  const log = await prisma.watchLog.findUnique({
    where: { userId_movieId: { userId, movieId } },
  });

  return NextResponse.json(log);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ movieId: string }> },
) {
  const userId = await getAppUserId();
  const { movieId } = await params;
  const body = await req.json() as {
    score?: number;
    emotion?: string;
    memo?: string;
    chatSummary?: string;
    promptUsed?: string;
  };

  const log = await prisma.watchLog.upsert({
    where: { userId_movieId: { userId, movieId } },
    update: body,
    create: { userId, movieId, ...body },
  });

  return NextResponse.json(log);
}
