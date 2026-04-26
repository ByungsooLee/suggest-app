import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

type RequireUserResult =
  | {
      ok: true;
      userId: string;
    }
  | {
      ok: false;
      response: Response;
    };

export async function requireUser(): Promise<RequireUserResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      ok: false,
      response: Response.json(
        {
          code: "UNAUTHORIZED",
          message: "Authentication required.",
        },
        { status: 401 },
      ),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  });
  if (!user) {
    return {
      ok: false,
      response: Response.json(
        {
          code: "SESSION_STALE",
          message: "Session is stale. Please sign in again.",
        },
        { status: 401 },
      ),
    };
  }

  return {
    ok: true,
    userId: session.user.id,
  };
}
