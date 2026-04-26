-- CreateEnum
CREATE TYPE "WatchedCatalogSource" AS ENUM ('manual', 'onboarding', 'search_add', 'quick_classify', 'recommendation');

-- CreateEnum
CREATE TYPE "QuickReactionAction" AS ENUM ('seen', 'not_seen', 'liked', 'not_for_me', 'skip');

-- AlterTable
ALTER TABLE "UserWatchedContent"
ADD COLUMN "catalogSource" "WatchedCatalogSource" NOT NULL DEFAULT 'manual',
ADD COLUMN "quickConfidence" INTEGER;

-- CreateTable
CREATE TABLE "QuickReactionLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "shownAt" TIMESTAMP(3) NOT NULL,
    "action" "QuickReactionAction" NOT NULL,
    "sessionToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuickReactionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuickReactionLog_userId_createdAt_idx" ON "QuickReactionLog"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "QuickReactionLog_userId_movieId_idx" ON "QuickReactionLog"("userId", "movieId");

-- CreateIndex
CREATE INDEX "QuickReactionLog_sessionToken_createdAt_idx" ON "QuickReactionLog"("sessionToken", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "QuickReactionLog" ADD CONSTRAINT "QuickReactionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuickReactionLog" ADD CONSTRAINT "QuickReactionLog_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
