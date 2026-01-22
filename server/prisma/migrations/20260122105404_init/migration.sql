-- CreateEnum
CREATE TYPE "public"."FileCategory" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'OTHER');

-- CreateTable
CREATE TABLE "public"."Member" (
    "idx" SERIAL NOT NULL,
    "id" VARCHAR(30) NOT NULL,
    "password" VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "public"."Memo" (
    "idx" SERIAL NOT NULL,
    "memberIdx" INTEGER NOT NULL,
    "title" VARCHAR(200),
    "content" JSONB,
    "text" TEXT,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Memo_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "public"."File" (
    "idx" SERIAL NOT NULL,
    "memoIdx" INTEGER,
    "fileKey" TEXT NOT NULL,
    "fileName" VARCHAR(45) NOT NULL,
    "fileType" VARCHAR(15) NOT NULL,
    "fileMimeType" TEXT NOT NULL,
    "fileSize" BIGINT NOT NULL,
    "fileCategory" "public"."FileCategory" NOT NULL DEFAULT 'OTHER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "File_pkey" PRIMARY KEY ("idx")
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_id_key" ON "public"."Member"("id");

-- CreateIndex
CREATE INDEX "Memo_memberIdx_idx" ON "public"."Memo"("memberIdx");

-- CreateIndex
CREATE INDEX "Memo_memberIdx_pinned_idx" ON "public"."Memo"("memberIdx", "pinned");

-- CreateIndex
CREATE INDEX "Memo_memberIdx_archived_idx" ON "public"."Memo"("memberIdx", "archived");

-- CreateIndex
CREATE UNIQUE INDEX "File_fileKey_key" ON "public"."File"("fileKey");

-- CreateIndex
CREATE INDEX "File_fileKey_idx" ON "public"."File"("fileKey");

-- CreateIndex
CREATE INDEX "File_memoIdx_idx" ON "public"."File"("memoIdx");

-- AddForeignKey
ALTER TABLE "public"."Memo" ADD CONSTRAINT "Memo_memberIdx_fkey" FOREIGN KEY ("memberIdx") REFERENCES "public"."Member"("idx") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."File" ADD CONSTRAINT "File_memoIdx_fkey" FOREIGN KEY ("memoIdx") REFERENCES "public"."Memo"("idx") ON DELETE SET NULL ON UPDATE CASCADE;
