import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { MbtiCompatibilityClient } from "./mbti-compatibility-client";

export default async function MbtiPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await prisma.userOnboardingProfile.findUnique({
    where: { userId: session.user.id },
    select: { mbtiType: true },
  });

  return <MbtiCompatibilityClient myMbti={profile?.mbtiType ?? null} />;
}
