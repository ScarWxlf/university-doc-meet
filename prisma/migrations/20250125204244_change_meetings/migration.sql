/*
  Warnings:

  - A unique constraint covering the columns `[roomName]` on the table `Meeting` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdById` to the `Meeting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomName` to the `Meeting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "createdById" INTEGER NOT NULL,
ADD COLUMN     "roomName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Meeting_roomName_key" ON "Meeting"("roomName");

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
