/*
  Warnings:

  - You are about to drop the column `userId` on the `UserLogin` table. All the data in the column will be lost.
  - Added the required column `email` to the `UserLogin` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserLogin" DROP CONSTRAINT "UserLogin_userId_fkey";

-- AlterTable
ALTER TABLE "UserLogin" DROP COLUMN "userId",
ADD COLUMN     "email" TEXT NOT NULL;
