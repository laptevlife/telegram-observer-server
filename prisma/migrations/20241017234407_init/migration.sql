-- DropIndex
DROP INDEX "Chat_accessHash_key";

-- AlterTable
ALTER TABLE "Chat" ALTER COLUMN "accessHash" SET DATA TYPE TEXT;
