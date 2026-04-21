import { auth } from "@/auth";

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

  return {
    ok: true,
    userId: session.user.id,
  };
}
