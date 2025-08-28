/*
  Warnings:

  - You are about to drop the column `description` on the `NetworkVolume` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `NetworkVolume` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `NetworkVolume` table. All the data in the column will be lost.
  - Added the required column `runpodId` to the `NetworkVolume` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."NetworkVolume" DROP COLUMN "description",
DROP COLUMN "name",
DROP COLUMN "size",
ADD COLUMN     "runpodId" TEXT NOT NULL;
