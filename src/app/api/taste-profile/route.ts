import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;

  const profile = await prisma.userTasteProfile.findFirst({
    where: { userId: authResult.userId },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ profile }, { status: 200 });
}
