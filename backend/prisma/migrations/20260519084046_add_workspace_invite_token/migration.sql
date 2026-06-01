/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `WorkspaceInvite` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `expiresAt` to the `WorkspaceInvite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token` to the `WorkspaceInvite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkspaceInvite" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "token" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceInvite_token_key" ON "WorkspaceInvite"("token");
