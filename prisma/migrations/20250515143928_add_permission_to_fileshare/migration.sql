-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('VIEW', 'EDIT');

-- AlterTable
ALTER TABLE "FileShare" ADD COLUMN     "permission" "Permission" NOT NULL DEFAULT 'EDIT';
