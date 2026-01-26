/*
  Warnings:

  - Added the required column `createdByUserId` to the `GameInvite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GameInvite" ADD COLUMN     "createdByUserId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "GameInvite" ADD CONSTRAINT "GameInvite_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
