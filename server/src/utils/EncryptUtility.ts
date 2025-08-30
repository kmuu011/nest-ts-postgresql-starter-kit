import { createHash } from "node:crypto";
import { config } from "../config";

export class EncryptUtility {
  static encryptMemberPassword(password: string): string {
    return createHash(config.memberAuth.password.hashAlgorithm)
      .update(password + config.memberAuth.password.salt)
      .digest("hex");
  }
}