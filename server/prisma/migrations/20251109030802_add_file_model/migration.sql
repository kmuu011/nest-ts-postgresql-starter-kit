-- DropForeignKey
ALTER TABLE "public"."Memo" DROP CONSTRAINT "Memo_memberIdx_fkey";

-- DropIndex
DROP INDEX "public"."idx_memo_content_pgroonga";

-- CreateTable
CREATE TABLE "public"."File" (
    "idx" SERIAL NOT NULL,
    "memberIdx" INTEGER NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileName" VARCHAR(45) NOT NULL,
    "fileType" VARCHAR(15) NOT NULL,
    "fileSize" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "File_pkey" PRIMARY KEY ("idx")
);

-- CreateIndex
CREATE INDEX "File_memberIdx_idx" ON "public"."File"("memberIdx");

-- AddForeignKey
ALTER TABLE "public"."Memo" ADD CONSTRAINT "Memo_memberIdx_fkey" FOREIGN KEY ("memberIdx") REFERENCES "public"."Member"("idx") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."File" ADD CONSTRAINT "File_memberIdx_fkey" FOREIGN KEY ("memberIdx") REFERENCES "public"."Member"("idx") ON DELETE CASCADE ON UPDATE CASCADE;
