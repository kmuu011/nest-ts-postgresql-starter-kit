import { SESSION_KEY } from "../constants/session";
import { config } from "../config";
import type { Response } from "express";

export class CookieUtility {
  static setSessionKey(
    res: Response,
    sessionKey: string
  ) {
    res.cookie(
      SESSION_KEY,
      sessionKey,
      {
        httpOnly: true,
        secure: config.serverType !== "dev",
        sameSite: "strict",
        maxAge: config.memberAuth.session.expireTime * 1000
      }
    )
  }

  static deleteSessionKey(
    res: Response,
  ) {
    res.clearCookie(SESSION_KEY);
  }
}