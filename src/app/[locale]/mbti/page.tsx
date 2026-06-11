import { getAppUserId } from "@/lib/auth/app-user";
import { prisma } from "@/lib/db/prisma";
import { MbtiCompatibilityClient } from "./mbti-compatibility-client";

export default async function MbtiPage() {
  const userId = await getAppUserId();

  const profile = await prisma.userOnboardingProfile.findUnique({
    where: { userId },
    select: { mbtiType: true },
  });

  return <MbtiCompatibilityClient myMbti={profile?.mbtiType ?? null} />;
}
