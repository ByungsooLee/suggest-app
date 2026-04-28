import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { generateMoviePrompt, type PromptType } from "@/lib/prompts/movie-prompt-generator";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const type = (req.nextUrl.searchParams.get("type") ?? "director") as PromptType;

  const isPremium = false;
  if (type !== "director" && !isPremium) {
    return NextResponse.json({ error: "Premium required" }, { status: 403 });
  }

  const movie = await prisma.movie.findUnique({
    where: { id },
    select: { title: true, releaseYear: true, directors: true, cast: true, overview: true, genrePrimary: true },
  });

  if (!movie) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const prompt = generateMoviePrompt({ ...movie, overview: movie.overview ?? undefined }, type);
  return NextResponse.json({ prompt });
}
