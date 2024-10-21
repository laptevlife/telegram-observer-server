/*
  Warnings:

  - A unique constraint covering the columns `[accessHash]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `accessHash` on the `Chat` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "accessHash",
ADD COLUMN     "accessHash" BIGINT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Chat_accessHash_key" ON "Chat"("accessHash");
