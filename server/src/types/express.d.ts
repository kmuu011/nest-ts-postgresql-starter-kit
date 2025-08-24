import {Member} from "@prisma/client";

declare module "express-serve-static-core" {
  interface Request {
    memberInfo?: Omit<Member, "password"> | null
  }
}

export {};