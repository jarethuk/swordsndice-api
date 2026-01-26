/*
  Warnings:

  - You are about to drop the column `token` on the `UserLogin` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "UserLogin_token_key";

-- AlterTable
ALTER TABLE "UserLogin" DROP COLUMN "token";
