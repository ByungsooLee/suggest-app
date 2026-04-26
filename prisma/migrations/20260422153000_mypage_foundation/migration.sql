-- CreateEnum
CREATE TYPE "WatchedContentType" AS ENUM ('movie', 'drama');

-- CreateEnum
CREATE TYPE "WatchedContentSource" AS ENUM ('onboarding_known', 'onboarding_liked', 'recommend_like', 'manual');

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "useFavoritesInRecommendations" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "UserWatchedContent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentType" "WatchedContentType" NOT NULL,
    "title" TEXT NOT NULL,
    "posterUrl" TEXT,
    "watched" BOOLEAN NOT NULL DEFAULT true,
    "movieId" TEXT,
    "source" "WatchedContentSource" NOT NULL DEFAULT 'manual',
    "watchedAt" TIMESTAMP(3),
    "ratingScore" INTEGER,
    "memo" TEXT,
    "rewatch" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserWatchedContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserWatchedContent_userId_movieId_contentType_key" ON "UserWatchedContent"("userId", "movieId", "contentType");

-- CreateIndex
CREATE INDEX "UserWatchedContent_userId_createdAt_idx" ON "UserWatchedContent"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "UserWatchedContent_contentType_userId_idx" ON "UserWatchedContent"("contentType", "userId");

-- CreateIndex
CREATE INDEX "UserWatchedContent_movieId_idx" ON "UserWatchedContent"("movieId");

-- AddForeignKey
ALTER TABLE "UserWatchedContent" ADD CONSTRAINT "UserWatchedContent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWatchedContent" ADD CONSTRAINT "UserWatchedContent_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE SET NULL ON UPDATE CASCADE;
