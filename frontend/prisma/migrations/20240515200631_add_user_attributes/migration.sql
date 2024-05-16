/*
  Warnings:

  - Added the required column `industry` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "industry" TEXT NOT NULL,
ADD COLUMN     "profileComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "receiveEmails" BOOLEAN NOT NULL DEFAULT false;
