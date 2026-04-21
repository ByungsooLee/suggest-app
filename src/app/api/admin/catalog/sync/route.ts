import { requireUser } from "@/lib/auth/require-user";

export async function POST() {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;

  return Response.json(
    {
      ok: true,
      status: "accepted",
      message: "Catalog sync endpoint is ready. External provider worker can be connected in the next phase.",
      acceptedAt: new Date().toISOString(),
    },
    { status: 202 },
  );
}
