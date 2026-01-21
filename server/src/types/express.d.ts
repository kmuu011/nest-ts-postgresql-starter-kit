import { File, Member, Memo, MemoBlock } from "@prisma/client";

declare module "express-serve-static-core" {
  interface Request {
    memberInfo?: Omit<Member, "password"> | null,
    memoInfo?: Memo | null,
    fileInfo?: File | null,
    blockInfo?: MemoBlock | null
  }
}

export { };