import { NextResponse } from "next/server";
import { getAppUserId } from "@/lib/auth/app-user";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const userId = await getAppUserId();
  const profile = await prisma.userMovieProfile.findUnique({
    where: { userId: userId },
    select: { totalSwipes: true, personalityLabel: true },
  });

  return NextResponse.json({
    totalSwipes: profile?.totalSwipes ?? 0,
    personalityLabel: profile?.personalityLabel ?? null,
  });
}
