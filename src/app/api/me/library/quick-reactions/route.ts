import { getAppUserId } from "@/lib/auth/app-user";
import { persistQuickReactions } from "@/lib/library/quick-reaction";
import { parseJson } from "@/lib/validation/http";
import { QuickReactionSubmitSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const userId = await getAppUserId();
  const parsed = await parseJson(request, QuickReactionSubmitSchema);
  if (!parsed.ok) return parsed.response;

  const result = await persistQuickReactions({
    userId: userId,
    events: parsed.data.events,
  });

  return Response.json(result, { status: 201 });
}
