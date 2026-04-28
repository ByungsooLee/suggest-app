import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;

  const profile = await prisma.userMovieProfile.findUnique({
    where: { userId: authResult.userId },
    select: { totalSwipes: true, personalityLabel: true },
  });

  return NextResponse.json({
    totalSwipes: profile?.totalSwipes ?? 0,
    personalityLabel: profile?.personalityLabel ?? null,
  });
}
