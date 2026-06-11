import { getAppUserId } from "@/lib/auth/app-user";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const userId = await getAppUserId();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      onboardingCompletedAt: true,
    },
  });

  return Response.json(
    {
      user: user
        ? {
            ...user,
            onboardingCompletedAt: user.onboardingCompletedAt?.toISOString() ?? null,
          }
        : null,
    },
    { status: 200 },
  );
}
