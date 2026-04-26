-- CreateEnum
CREATE TYPE "MbtiType" AS ENUM ('INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP');

-- CreateEnum
CREATE TYPE "UserMood" AS ENUM ('want_healing', 'want_to_be_moved', 'want_excitement', 'want_to_laugh', 'want_tension', 'want_quiet_immersion', 'want_to_switch_off', 'okay_with_something_heavy');

-- CreateEnum
CREATE TYPE "OnboardingReactionType" AS ENUM ('liked', 'not_for_me', 'dont_know');

-- AlterTable
ALTER TABLE "Movie"
ADD COLUMN "moodUplifting" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
ADD COLUMN "paceFast" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
ADD COLUMN "tension" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
ADD COLUMN "accessibility" DOUBLE PRECISION NOT NULL DEFAULT 0.5;

-- AlterTable
ALTER TABLE "RecommendationResult"
ADD COLUMN "knownTasteScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "currentMoodScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "mbtiAdjustmentScore" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "UserOnboardingProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mbtiType" "MbtiType",
    "selectedMood" "UserMood",
    "onboardingVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserOnboardingProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingMovieReaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "reactionType" "OnboardingReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingMovieReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserOnboardingProfile_userId_key" ON "UserOnboardingProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingMovieReaction_userId_movieId_key" ON "OnboardingMovieReaction"("userId", "movieId");

-- CreateIndex
CREATE INDEX "OnboardingMovieReaction_userId_reactionType_idx" ON "OnboardingMovieReaction"("userId", "reactionType");

-- CreateIndex
CREATE INDEX "OnboardingMovieReaction_movieId_idx" ON "OnboardingMovieReaction"("movieId");

-- AddForeignKey
ALTER TABLE "OnboardingMovieReaction" ADD CONSTRAINT "OnboardingMovieReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingMovieReaction" ADD CONSTRAINT "OnboardingMovieReaction_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnboardingProfile" ADD CONSTRAINT "UserOnboardingProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
