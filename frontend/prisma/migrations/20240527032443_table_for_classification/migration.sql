/*
  Warnings:

  - You are about to drop the column `categories` on the `TransactionClassification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TransactionClassification" DROP COLUMN "categories";

-- CreateTable
CREATE TABLE "Classification" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "transactionClassificationId" INTEGER NOT NULL,

    CONSTRAINT "Classification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Classification_transactionClassificationId_category_key" ON "Classification"("transactionClassificationId", "category");

-- AddForeignKey
ALTER TABLE "Classification" ADD CONSTRAINT "Classification_transactionClassificationId_fkey" FOREIGN KEY ("transactionClassificationId") REFERENCES "TransactionClassification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
