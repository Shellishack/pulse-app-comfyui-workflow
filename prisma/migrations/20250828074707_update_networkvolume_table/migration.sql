/*
  Warnings:

  - A unique constraint covering the columns `[runpodId]` on the table `NetworkVolume` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "NetworkVolume_runpodId_key" ON "public"."NetworkVolume"("runpodId");
