import { recommendMovies } from "@/lib/recommendation/engine";
import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db/prisma";
import { parseJson } from "@/lib/validation/http";
import { RecommendationsRequestSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;

  const parsed = await parseJson(request, RecommendationsRequestSchema);
  if (!parsed.ok) return parsed.response;

  const tasteProfile = await prisma.userTasteProfile.findFirst({
    where: { userId: authResult.userId },
    orderBy: { createdAt: "desc" },
  });

  if (!tasteProfile) {
    return Response.json(
      {
        code: "TASTE_PROFILE_MISSING",
        message: "Taste profile is missing. Complete onboarding or rebuild profile.",
      },
      { status: 409 },
    );
  }

  const movies = await prisma.movie.findMany();

  const recommendations = recommendMovies({
    movies,
    tasteProfile,
    contextInput: {
      currentMoods: parsed.data.currentMoods,
      desiredRuntimeMin: parsed.data.desiredRuntimeMin,
      desiredRuntimeMax: parsed.data.desiredRuntimeMax,
      watchingWith: parsed.data.watchingWith,
      excludeContentWarnings: parsed.data.excludeContentWarnings,
      excludeTags: parsed.data.excludeTags,
    },
  });

  const session = await prisma.recommendationSession.create({
    data: {
      userId: authResult.userId,
      tasteProfileId: tasteProfile.id,
      status: recommendations.length === 0 ? "empty" : "completed",
      currentMoods: parsed.data.currentMoods,
      desiredRuntimeMin: parsed.data.desiredRuntimeMin,
      desiredRuntimeMax: parsed.data.desiredRuntimeMax,
      watchingWith: parsed.data.watchingWith,
      excludeContentWarnings: parsed.data.excludeContentWarnings,
      excludeTags: parsed.data.excludeTags,
    },
  });

  if (recommendations.length === 0) {
    return Response.json({
      sessionId: session.id,
      status: "empty",
      topPick: null,
      backups: [],
    });
  }

  await prisma.recommendationResult.createMany({
    data: recommendations.map((item) => ({
      sessionId: session.id,
      movieId: item.movieId,
      rank: item.rank,
      totalScore: item.breakdown.totalScore,
      moodMatchScore: item.breakdown.moodMatchScore,
      contextMatchScore: item.breakdown.contextMatchScore,
      runtimeFitScore: item.breakdown.runtimeFitScore,
      styleMatchScore: item.breakdown.styleMatchScore,
      reason1: item.reasons[0]?.text ?? "総合バランスが今夜向きの1本です。",
      reason2: item.reasons[1]?.text,
      reason3: item.reasons[2]?.text,
    })),
  });

  const [topPick, ...backups] = recommendations;

  return Response.json(
    {
      sessionId: session.id,
      topPick: {
        rank: topPick.rank,
        movieId: topPick.movieId,
        title: topPick.title,
        score: topPick.score,
        confidenceLabel: topPick.confidenceLabel,
        reasons: topPick.reasons,
      },
      backups: backups.map((item) => ({
        rank: item.rank,
        movieId: item.movieId,
        title: item.title,
        score: item.score,
        confidenceLabel: item.confidenceLabel,
        reasons: item.reasons,
      })),
    },
    { status: 201 },
  );
}
