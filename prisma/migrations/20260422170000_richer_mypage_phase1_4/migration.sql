-- CreateEnum
CREATE TYPE "WatchedReaction" AS ENUM ('like', 'normal', 'dislike');

-- CreateEnum
CREATE TYPE "WatchSource" AS ENUM ('netflix', 'prime_video', 'cinema', 'other');

-- CreateEnum
CREATE TYPE "PreferenceInfluenceStrength" AS ENUM ('light', 'balanced', 'strong');

-- CreateEnum
CREATE TYPE "RecommendationStyleMode" AS ENUM ('safe', 'balanced', 'discovery_focused');

-- CreateEnum
CREATE TYPE "WatchlistSource" AS ENUM ('recommendation', 'manual');

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "preferenceInfluenceStrength" "PreferenceInfluenceStrength" NOT NULL DEFAULT 'balanced',
ADD COLUMN "recommendationStyleMode" "RecommendationStyleMode" NOT NULL DEFAULT 'balanced';

-- AlterTable
ALTER TABLE "UserWatchedContent"
ADD COLUMN "reaction" "WatchedReaction",
ADD COLUMN "watchSource" "WatchSource";

-- CreateTable
CREATE TABLE "UserWatchlistItem" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "contentType" "WatchedContentType" NOT NULL,
  "title" TEXT NOT NULL,
  "posterUrl" TEXT,
  "movieId" TEXT,
  "note" TEXT,
  "priority" INTEGER,
  "source" "WatchlistSource" NOT NULL DEFAULT 'manual',
  "recommendedFromResultId" TEXT,
  "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserWatchlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserWatchlistItem_userId_movieId_contentType_key" ON "UserWatchlistItem"("userId", "movieId", "contentType");

-- CreateIndex
CREATE INDEX "UserWatchlistItem_userId_savedAt_idx" ON "UserWatchlistItem"("userId", "savedAt" DESC);

-- CreateIndex
CREATE INDEX "UserWatchlistItem_movieId_idx" ON "UserWatchlistItem"("movieId");

-- AddForeignKey
ALTER TABLE "UserWatchlistItem"
ADD CONSTRAINT "UserWatchlistItem_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWatchlistItem"
ADD CONSTRAINT "UserWatchlistItem_movieId_fkey"
FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE SET NULL ON UPDATE CASCADE;
