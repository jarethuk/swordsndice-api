-- AlterTable
ALTER TABLE "GameMember" ADD COLUMN     "modelCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "modelCountRemaining" INTEGER NOT NULL DEFAULT 0;
