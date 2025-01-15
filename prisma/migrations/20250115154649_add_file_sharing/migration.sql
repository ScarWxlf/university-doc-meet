/*
  Warnings:

  - You are about to drop the column `content` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Document` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[googleId]` on the table `Document` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `googleId` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "content",
DROP COLUMN "createdAt",
DROP COLUMN "title",
DROP COLUMN "updatedAt",
ADD COLUMN     "googleId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "FileShare" (
    "id" SERIAL NOT NULL,
    "documentId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,

    CONSTRAINT "FileShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Document_googleId_key" ON "Document"("googleId");

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("googleId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;
