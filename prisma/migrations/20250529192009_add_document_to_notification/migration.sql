-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "documentId" TEXT;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("googleId") ON DELETE CASCADE ON UPDATE CASCADE;
