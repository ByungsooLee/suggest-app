import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db/prisma";
import { parseJson } from "@/lib/validation/http";
import { FeedbackRequestSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;

  const parsed = await parseJson(request, FeedbackRequestSchema);
  if (!parsed.ok) return parsed.response;

  const session = await prisma.recommendationSession.findFirst({
    where: { id: parsed.data.sessionId, userId: authResult.userId },
    select: { id: true },
  });

  if (!session) {
    return Response.json(
      {
        code: "SESSION_NOT_FOUND",
        message: "Recommendation session not found.",
      },
      { status: 404 },
    );
  }

  const feedback = await prisma.feedbackLog.create({
    data: {
      userId: authResult.userId,
      sessionId: parsed.data.sessionId,
      recommendationResultId: parsed.data.recommendationResultId,
      reaction: parsed.data.reaction,
      comment: parsed.data.comment,
    },
  });

  return Response.json({ ok: true, feedbackId: feedback.id }, { status: 201 });
}
