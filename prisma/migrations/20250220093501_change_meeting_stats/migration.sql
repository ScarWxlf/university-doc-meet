/*
  Warnings:

  - Added the required column `createdById` to the `MeetingStats` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MeetingStats" ADD COLUMN     "createdById" INTEGER NOT NULL;
