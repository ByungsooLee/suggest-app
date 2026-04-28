import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ movieId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { movieId } = await params;
  const log = await prisma.watchLog.findUnique({
    where: { userId_movieId: { userId: session.user.id, movieId } },
  });

  return NextResponse.json(log);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ movieId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { movieId } = await params;
  const body = await req.json() as {
    score?: number;
    emotion?: string;
    memo?: string;
    chatSummary?: string;
    promptUsed?: string;
  };

  const log = await prisma.watchLog.upsert({
    where: { userId_movieId: { userId: session.user.id, movieId } },
    update: body,
    create: { userId: session.user.id, movieId, ...body },
  });

  return NextResponse.json(log);
}
