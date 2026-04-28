ALTER TYPE "PersonRole" ADD VALUE IF NOT EXISTS 'writer';

CREATE TABLE IF NOT EXISTS "Person" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "normalizedName" TEXT NOT NULL,
  "tmdbId" INTEGER,
  "profilePath" TEXT,
  "biography" TEXT,
  "knownForDepartment" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "MovieCredit" (
  "id" TEXT NOT NULL,
  "movieId" TEXT NOT NULL,
  "personId" TEXT NOT NULL,
  "role" "PersonRole" NOT NULL,
  "creditOrder" INTEGER,
  "character" TEXT,
  "job" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "MovieCredit_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "UserMovieProfile"
ADD COLUMN IF NOT EXISTS "writerAffinity" JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS "Person_tmdbId_key" ON "Person"("tmdbId");
CREATE INDEX IF NOT EXISTS "Person_normalizedName_idx" ON "Person"("normalizedName");
CREATE UNIQUE INDEX IF NOT EXISTS "Person_normalizedName_tmdbId_key" ON "Person"("normalizedName", "tmdbId");

CREATE UNIQUE INDEX IF NOT EXISTS "MovieCredit_movieId_personId_role_key"
ON "MovieCredit"("movieId", "personId", "role");
CREATE INDEX IF NOT EXISTS "MovieCredit_movieId_role_creditOrder_idx"
ON "MovieCredit"("movieId", "role", "creditOrder");
CREATE INDEX IF NOT EXISTS "MovieCredit_personId_role_creditOrder_idx"
ON "MovieCredit"("personId", "role", "creditOrder");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'MovieCredit_movieId_fkey'
  ) THEN
    ALTER TABLE "MovieCredit"
    ADD CONSTRAINT "MovieCredit_movieId_fkey"
    FOREIGN KEY ("movieId") REFERENCES "Movie"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'MovieCredit_personId_fkey'
  ) THEN
    ALTER TABLE "MovieCredit"
    ADD CONSTRAINT "MovieCredit_personId_fkey"
    FOREIGN KEY ("personId") REFERENCES "Person"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
