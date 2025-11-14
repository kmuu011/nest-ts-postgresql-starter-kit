import { File, Member, Memo } from "@prisma/client";

declare module "express-serve-static-core" {
  interface Request {
    memberInfo?: Omit<Member, "password"> | null,
    memoInfo?: Memo | null,
    fileInfo?: File | null
  }
}

export { };