-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "Competition" AS ENUM ('BRASILEIRAO_SERIE_A', 'COPA_LIBERTADORES', 'UEFA_CHAMPIONS_LEAGUE', 'PREMIER_LEAGUE', 'LA_LIGA', 'WORLD_CUP', 'COPA_AMERICA');

-- CreateTable
CREATE TABLE "DatasetManifest" (
    "id" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "extracted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "raw_file_size_bytes" INTEGER NOT NULL,
    "filepath" TEXT NOT NULL,

    CONSTRAINT "DatasetManifest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Statistic" (
    "id" TEXT NOT NULL,
    "competition" "Competition" NOT NULL,
    "team" TEXT NOT NULL,
    "observed_at" TIMESTAMP(3) NOT NULL,
    "possession_percentage" DOUBLE PRECISION,
    "expected_goals" DOUBLE PRECISION,
    "embedding" vector(1536),

    CONSTRAINT "Statistic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DatasetManifest_checksum_key" ON "DatasetManifest"("checksum");

-- CreateIndex
CREATE INDEX "DatasetManifest_category_source_idx" ON "DatasetManifest"("category", "source");

-- CreateIndex
CREATE INDEX "Statistic_team_competition_idx" ON "Statistic"("team", "competition");
