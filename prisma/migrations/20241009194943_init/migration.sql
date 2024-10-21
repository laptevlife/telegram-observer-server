/*
  Warnings:

  - Changed the type of `chatId` on the `Chat` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "chatId",
ADD COLUMN     "chatId" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "userId" SET DATA TYPE BIGINT;

-- CreateIndex
CREATE UNIQUE INDEX "Chat_chatId_key" ON "Chat"("chatId");
