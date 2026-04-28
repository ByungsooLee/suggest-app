import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { updateUserMovieProfile } from "@/lib/discover/update-profile";
import { generatePersonalityLabel } from "@/lib/discover/generate-personality";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { movieId, action, reasons = [] } = body as {
    movieId: string;
    action: "like" | "pass" | "watchlist";
    reasons?: string[];
  };

  if (!movieId || !["like", "pass", "watchlist"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
    select: {
      id: true,
      genrePrimary: true,
      directors: true,
      paceSlowBurn: true,
      complexity: true,
      moodDark: true,
      credits: {
        select: {
          role: true,
          person: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
  if (!movie) return NextResponse.json({ error: "Movie not found" }, { status: 404 });

  await prisma.movieSwipe.upsert({
    where: { userId_movieId: { userId: session.user.id, movieId } },
    create: { userId: session.user.id, movieId, action, reasons },
    update: { action, reasons },
  });

  await updateUserMovieProfile(session.user.id, movie, action, reasons);

  // Check for 100-swipe milestone
  const profile = await prisma.userMovieProfile.findUnique({
    where: { userId: session.user.id },
    select: { totalSwipes: true, personalityLabel: true, personalityUpdatedAt: true },
  });

  let personalityLabel: string | null = null;
  if (profile && profile.totalSwipes >= 100 && !profile.personalityUpdatedAt) {
    personalityLabel = await generatePersonalityLabel(session.user.id);
  } else if (profile?.personalityLabel && profile.totalSwipes % 100 === 0 && profile.totalSwipes > 0) {
    // Refresh every 100 swipes
    personalityLabel = await generatePersonalityLabel(session.user.id);
  }

  return NextResponse.json({ ok: true, personalityLabel });
}
