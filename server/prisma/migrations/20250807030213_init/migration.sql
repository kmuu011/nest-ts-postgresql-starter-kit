-- CreateTable
CREATE TABLE "public"."Member" (
    "idx" SERIAL NOT NULL,
    "id" VARCHAR(30) NOT NULL,
    "password" VARCHAR(200) NOT NULL,
    "nickname" VARCHAR(30) NOT NULL,
    "email" VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "public"."Memo" (
    "idx" SERIAL NOT NULL,
    "memo" VARCHAR(100) NOT NULL,
    "memberIdx" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Memo_pkey" PRIMARY KEY ("idx")
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_id_key" ON "public"."Member"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Member_nickname_key" ON "public"."Member"("nickname");

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "public"."Member"("email");

-- AddForeignKey
ALTER TABLE "public"."Memo" ADD CONSTRAINT "Memo_memberIdx_fkey" FOREIGN KEY ("memberIdx") REFERENCES "public"."Member"("idx") ON DELETE RESTRICT ON UPDATE CASCADE;
