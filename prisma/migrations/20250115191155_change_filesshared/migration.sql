/*
  Warnings:

  - Added the required column `userOwnerId` to the `FileShare` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FileShare" DROP CONSTRAINT "FileShare_userEmail_fkey";

-- AlterTable
ALTER TABLE "FileShare" ADD COLUMN     "userOwnerId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_userOwnerId_fkey" FOREIGN KEY ("userOwnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
