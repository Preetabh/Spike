/*
  Warnings:

  - The values [public,private] on the enum `ChannelType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `_ChannelMembers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ReactionUsers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[messageId,userId,emoji]` on the table `MessageReaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `MessageReaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('text', 'image', 'video', 'audio', 'file', 'system');

-- AlterEnum
BEGIN;
CREATE TYPE "ChannelType_new" AS ENUM ('channel', 'private_channel', 'dm', 'group');
ALTER TABLE "public"."Channel" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Channel" ALTER COLUMN "type" TYPE "ChannelType_new" USING ("type"::text::"ChannelType_new");
ALTER TYPE "ChannelType" RENAME TO "ChannelType_old";
ALTER TYPE "ChannelType_new" RENAME TO "ChannelType";
DROP TYPE "public"."ChannelType_old";
ALTER TABLE "Channel" ALTER COLUMN "type" SET DEFAULT 'channel';
COMMIT;

-- DropForeignKey
ALTER TABLE "_ChannelMembers" DROP CONSTRAINT "_ChannelMembers_A_fkey";

-- DropForeignKey
ALTER TABLE "_ChannelMembers" DROP CONSTRAINT "_ChannelMembers_B_fkey";

-- DropForeignKey
ALTER TABLE "_ReactionUsers" DROP CONSTRAINT "_ReactionUsers_A_fkey";

-- DropForeignKey
ALTER TABLE "_ReactionUsers" DROP CONSTRAINT "_ReactionUsers_B_fkey";

-- DropIndex
DROP INDEX "Channel_name_workspaceId_key";

-- AlterTable
ALTER TABLE "Channel" ALTER COLUMN "type" SET DEFAULT 'channel';

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "messageType" "MessageType" NOT NULL DEFAULT 'text';

-- AlterTable
ALTER TABLE "MessageReaction" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "socketId" TEXT;

-- DropTable
DROP TABLE "_ChannelMembers";

-- DropTable
DROP TABLE "_ReactionUsers";

-- CreateTable
CREATE TABLE "MessageAttachment" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelMember" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT,
    "lastReadMessageId" TEXT,
    "muted" BOOLEAN NOT NULL DEFAULT false,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChannelMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelRead" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "lastReadMessageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChannelRead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MessageAttachment_messageId_idx" ON "MessageAttachment"("messageId");

-- CreateIndex
CREATE INDEX "ChannelMember_channelId_idx" ON "ChannelMember"("channelId");

-- CreateIndex
CREATE INDEX "ChannelMember_userId_idx" ON "ChannelMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelMember_channelId_userId_key" ON "ChannelMember"("channelId", "userId");

-- CreateIndex
CREATE INDEX "ChannelRead_userId_idx" ON "ChannelRead"("userId");

-- CreateIndex
CREATE INDEX "ChannelRead_channelId_idx" ON "ChannelRead"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelRead_userId_channelId_key" ON "ChannelRead"("userId", "channelId");

-- CreateIndex
CREATE INDEX "Channel_name_workspaceId_idx" ON "Channel"("name", "workspaceId");

-- CreateIndex
CREATE INDEX "Channel_updatedAt_idx" ON "Channel"("updatedAt");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "Message_channelId_createdAt_idx" ON "Message"("channelId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MessageReaction_messageId_userId_emoji_key" ON "MessageReaction"("messageId", "userId", "emoji");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- AddForeignKey
ALTER TABLE "MessageAttachment" ADD CONSTRAINT "MessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMember" ADD CONSTRAINT "ChannelMember_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMember" ADD CONSTRAINT "ChannelMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageReaction" ADD CONSTRAINT "MessageReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelRead" ADD CONSTRAINT "ChannelRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelRead" ADD CONSTRAINT "ChannelRead_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
