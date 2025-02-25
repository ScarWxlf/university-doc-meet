/*
  Warnings:

  - Added the required column `duration` to the `MeetingStats` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MeetingStats" ADD COLUMN     "duration" TEXT NOT NULL;
