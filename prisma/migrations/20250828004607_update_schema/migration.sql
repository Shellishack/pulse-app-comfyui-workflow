/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `AIModel` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AIModel_name_key" ON "public"."AIModel"("name");
