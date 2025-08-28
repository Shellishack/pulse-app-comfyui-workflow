-- CreateTable
CREATE TABLE "public"."NetworkVolume" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NetworkVolume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AIModel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "networkVolumeId" TEXT,

    CONSTRAINT "AIModel_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."AIModel" ADD CONSTRAINT "AIModel_networkVolumeId_fkey" FOREIGN KEY ("networkVolumeId") REFERENCES "public"."NetworkVolume"("id") ON DELETE SET NULL ON UPDATE CASCADE;
