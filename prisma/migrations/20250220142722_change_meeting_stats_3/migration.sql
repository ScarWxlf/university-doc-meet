/*
  Warnings:

  - The `events` column on the `MeetingStats` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "MeetingStats" DROP COLUMN "events",
ADD COLUMN     "events" JSONB NOT NULL DEFAULT '[]';
