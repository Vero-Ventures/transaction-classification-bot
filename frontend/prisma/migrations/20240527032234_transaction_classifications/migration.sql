-- CreateTable
CREATE TABLE "TransactionClassification" (
    "id" SERIAL NOT NULL,
    "transactionName" TEXT NOT NULL,
    "categories" JSONB NOT NULL,

    CONSTRAINT "TransactionClassification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TransactionClassification_transactionName_key" ON "TransactionClassification"("transactionName");
