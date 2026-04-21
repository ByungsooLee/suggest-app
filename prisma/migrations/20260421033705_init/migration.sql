-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('completed', 'empty');

-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('liked', 'too_dark', 'too_long', 'not_now', 'mismatch');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "onboardingCompletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "favoriteArtists" TEXT[],
    "favoriteMovies" TEXT[],
    "preferredMoods" TEXT[],
    "dislikedElements" TEXT[],
    "inputVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTasteProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourcePreferenceId" TEXT,
    "profileVersion" INTEGER NOT NULL DEFAULT 1,
    "summary" TEXT NOT NULL,
    "moodCalm" DOUBLE PRECISION NOT NULL,
    "moodDark" DOUBLE PRECISION NOT NULL,
    "moodEmotional" DOUBLE PRECISION NOT NULL,
    "toneStylish" DOUBLE PRECISION NOT NULL,
    "toneFunny" DOUBLE PRECISION NOT NULL,
    "paceSlowBurn" DOUBLE PRECISION NOT NULL,
    "complexity" DOUBLE PRECISION NOT NULL,
    "emotionalWeight" DOUBLE PRECISION NOT NULL,
    "runtimeToleranceMin" INTEGER NOT NULL,
    "runtimeToleranceMax" INTEGER NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTasteProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movie" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "releaseYear" INTEGER NOT NULL,
    "runtimeMinutes" INTEGER NOT NULL,
    "genrePrimary" TEXT NOT NULL,
    "genreSecondary" TEXT,
    "moodCalm" DOUBLE PRECISION NOT NULL,
    "moodDark" DOUBLE PRECISION NOT NULL,
    "moodEmotional" DOUBLE PRECISION NOT NULL,
    "toneStylish" DOUBLE PRECISION NOT NULL,
    "toneFunny" DOUBLE PRECISION NOT NULL,
    "paceSlowBurn" DOUBLE PRECISION NOT NULL,
    "complexity" DOUBLE PRECISION NOT NULL,
    "emotionalWeight" DOUBLE PRECISION NOT NULL,
    "moodTags" TEXT[],
    "watchContexts" TEXT[],
    "contentWarnings" TEXT[],
    "availabilityNote" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendationSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tasteProfileId" TEXT,
    "status" "RecommendationStatus" NOT NULL DEFAULT 'completed',
    "currentMoods" TEXT[],
    "desiredRuntimeMin" INTEGER NOT NULL,
    "desiredRuntimeMax" INTEGER NOT NULL,
    "watchingWith" TEXT NOT NULL,
    "excludeContentWarnings" TEXT[],
    "excludeTags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecommendationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendationResult" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "moodMatchScore" DOUBLE PRECISION NOT NULL,
    "contextMatchScore" DOUBLE PRECISION NOT NULL,
    "runtimeFitScore" DOUBLE PRECISION NOT NULL,
    "styleMatchScore" DOUBLE PRECISION NOT NULL,
    "reason1" TEXT NOT NULL,
    "reason2" TEXT,
    "reason3" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecommendationResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "recommendationResultId" TEXT,
    "reaction" "ReactionType" NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE INDEX "UserPreference_userId_createdAt_idx" ON "UserPreference"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "UserTasteProfile_userId_createdAt_idx" ON "UserTasteProfile"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "UserTasteProfile_sourcePreferenceId_idx" ON "UserTasteProfile"("sourcePreferenceId");

-- CreateIndex
CREATE INDEX "Movie_genrePrimary_releaseYear_idx" ON "Movie"("genrePrimary", "releaseYear");

-- CreateIndex
CREATE INDEX "Movie_runtimeMinutes_idx" ON "Movie"("runtimeMinutes");

-- CreateIndex
CREATE UNIQUE INDEX "Movie_title_releaseYear_key" ON "Movie"("title", "releaseYear");

-- CreateIndex
CREATE INDEX "RecommendationSession_userId_createdAt_idx" ON "RecommendationSession"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "RecommendationSession_tasteProfileId_idx" ON "RecommendationSession"("tasteProfileId");

-- CreateIndex
CREATE INDEX "RecommendationResult_sessionId_totalScore_idx" ON "RecommendationResult"("sessionId", "totalScore" DESC);

-- CreateIndex
CREATE INDEX "RecommendationResult_movieId_idx" ON "RecommendationResult"("movieId");

-- CreateIndex
CREATE UNIQUE INDEX "RecommendationResult_sessionId_rank_key" ON "RecommendationResult"("sessionId", "rank");

-- CreateIndex
CREATE INDEX "FeedbackLog_userId_createdAt_idx" ON "FeedbackLog"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "FeedbackLog_sessionId_idx" ON "FeedbackLog"("sessionId");

-- CreateIndex
CREATE INDEX "FeedbackLog_reaction_createdAt_idx" ON "FeedbackLog"("reaction", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTasteProfile" ADD CONSTRAINT "UserTasteProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTasteProfile" ADD CONSTRAINT "UserTasteProfile_sourcePreferenceId_fkey" FOREIGN KEY ("sourcePreferenceId") REFERENCES "UserPreference"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationSession" ADD CONSTRAINT "RecommendationSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationSession" ADD CONSTRAINT "RecommendationSession_tasteProfileId_fkey" FOREIGN KEY ("tasteProfileId") REFERENCES "UserTasteProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationResult" ADD CONSTRAINT "RecommendationResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "RecommendationSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationResult" ADD CONSTRAINT "RecommendationResult_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackLog" ADD CONSTRAINT "FeedbackLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackLog" ADD CONSTRAINT "FeedbackLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "RecommendationSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackLog" ADD CONSTRAINT "FeedbackLog_recommendationResultId_fkey" FOREIGN KEY ("recommendationResultId") REFERENCES "RecommendationResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;
