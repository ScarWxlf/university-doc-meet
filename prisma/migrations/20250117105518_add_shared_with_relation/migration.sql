-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;
