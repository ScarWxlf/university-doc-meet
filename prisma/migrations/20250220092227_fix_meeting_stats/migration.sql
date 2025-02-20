/*
  Warnings:

  - A unique constraint covering the columns `[roomName]` on the table `MeetingStats` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roomName` to the `MeetingStats` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MeetingStats" ADD COLUMN     "roomName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MeetingStats_roomName_key" ON "MeetingStats"("roomName");
