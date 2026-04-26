import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ user: null }, { status: 200 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
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
