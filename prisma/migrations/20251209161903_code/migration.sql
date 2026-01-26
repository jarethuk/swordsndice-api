/*
  Warnings:

  - Added the required column `code` to the `UserLogin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserLogin" ADD COLUMN     "code" TEXT NOT NULL;
