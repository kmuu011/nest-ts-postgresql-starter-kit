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
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Memo_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "public"."MemoBlock" (
    "idx" SERIAL NOT NULL,
    "memoIdx" INTEGER NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fileIdx" INTEGER,

    CONSTRAINT "MemoBlock_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "public"."File" (
    "idx" SERIAL NOT NULL,
    "memberIdx" INTEGER NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileName" VARCHAR(45) NOT NULL,
    "fileType" VARCHAR(15) NOT NULL,
    "fileMimeType" VARCHAR(30) NOT NULL,
    "fileSize" BIGINT NOT NULL,
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
CREATE UNIQUE INDEX "MemoBlock_fileIdx_key" ON "public"."MemoBlock"("fileIdx");

-- CreateIndex
CREATE INDEX "MemoBlock_memoIdx_idx" ON "public"."MemoBlock"("memoIdx");

-- CreateIndex
CREATE INDEX "MemoBlock_memoIdx_orderIndex_idx" ON "public"."MemoBlock"("memoIdx", "orderIndex");

-- CreateIndex
CREATE INDEX "MemoBlock_fileIdx_idx" ON "public"."MemoBlock"("fileIdx");

-- CreateIndex
CREATE INDEX "File_memberIdx_idx" ON "public"."File"("memberIdx");

-- AddForeignKey
ALTER TABLE "public"."Memo" ADD CONSTRAINT "Memo_memberIdx_fkey" FOREIGN KEY ("memberIdx") REFERENCES "public"."Member"("idx") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MemoBlock" ADD CONSTRAINT "MemoBlock_fileIdx_fkey" FOREIGN KEY ("fileIdx") REFERENCES "public"."File"("idx") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MemoBlock" ADD CONSTRAINT "MemoBlock_memoIdx_fkey" FOREIGN KEY ("memoIdx") REFERENCES "public"."Memo"("idx") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."File" ADD CONSTRAINT "File_memberIdx_fkey" FOREIGN KEY ("memberIdx") REFERENCES "public"."Member"("idx") ON DELETE CASCADE ON UPDATE CASCADE;
