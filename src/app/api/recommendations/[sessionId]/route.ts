import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db/prisma";

type ReasonType = "mood_match" | "context_match" | "runtime_fit" | "style_match" | "actor_match" | "director_match" | "review_match";
type ConfidenceLabel = "very_high" | "high" | "medium" | "low";

const inferReasonType = (index: number): ReasonType => {
  if (index === 0) return "mood_match";
  if (index === 1) return "context_match";
  if (index === 2) return "runtime_fit";
  return "style_match";
};

const inferConfidenceLabel = (score: number): ConfidenceLabel => {
  if (score >= 0.88) return "very_high";
  if (score >= 0.72) return "high";
  if (score >= 0.55) return "medium";
  return "low";
};

export async function GET(request: Request, context: { params: Promise<{ sessionId: string }> }) {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;

  const { sessionId } = await context.params;
  const debugEnabled = new URL(request.url).searchParams.get("debug") === "1";

  const session = await prisma.recommendationSession.findFirst({
    where: { id: sessionId, userId: authResult.userId },
    include: {
      results: {
        include: { movie: true },
        orderBy: { rank: "asc" },
      },
    },
  });

  if (!session) {
    return Response.json({ code: "NOT_FOUND", message: "Session not found." }, { status: 404 });
  }

  if (session.status === "empty") {
    return Response.json({
      sessionId: session.id,
      status: "empty",
      topPick: null,
      backups: [],
    });
  }

  const items = session.results.map((result) => ({
    rank: result.rank,
    movieId: result.movieId,
    title: result.movie.title,
    score: result.totalScore,
    confidenceLabel: inferConfidenceLabel(result.totalScore),
    posterUrl: result.movie.posterUrl,
    overview: result.movie.overview,
    directors: result.movie.directors,
    cast: result.movie.cast,
    reviewScore: result.movie.reviewScore,
    reviewSummary: result.movie.reviewSummary,
    reasons: [result.reason1, result.reason2, result.reason3]
      .filter((v): v is string => Boolean(v))
      .map((text, idx) => ({
        type: inferReasonType(idx),
        text,
      })),
    debug: debugEnabled
      ? {
          baseScore: result.baseScore,
          discoveryScore: result.discoveryScore,
          repetitionPenalty: result.repetitionPenalty,
          retrievalSupportScore: result.retrievalSupportScore,
          retrievalChannels: Array.isArray(result.retrievalChannels) ? result.retrievalChannels : [],
        }
      : undefined,
  }));

  return Response.json({
    sessionId: session.id,
    status: session.status,
    topPick: items[0] ?? null,
    backups: items.slice(1, 3),
  });
}
