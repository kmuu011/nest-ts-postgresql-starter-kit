/*
  Warnings:

  - You are about to drop the column `email` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `nickname` on the `Member` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Member_email_key";

-- DropIndex
DROP INDEX "public"."Member_nickname_key";

-- AlterTable
ALTER TABLE "public"."Member" DROP COLUMN "email",
DROP COLUMN "nickname";
