/*
  Warnings:

  - You are about to drop the column `iamge` on the `Group` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Group" DROP COLUMN "iamge",
ADD COLUMN     "image" TEXT;
