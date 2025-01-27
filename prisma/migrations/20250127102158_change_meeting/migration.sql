/*
  Warnings:

  - You are about to drop the `_MeetingParticipants` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_MeetingParticipants" DROP CONSTRAINT "_MeetingParticipants_A_fkey";

-- DropForeignKey
ALTER TABLE "_MeetingParticipants" DROP CONSTRAINT "_MeetingParticipants_B_fkey";

-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "invitedEmails" TEXT[];

-- DropTable
DROP TABLE "_MeetingParticipants";
