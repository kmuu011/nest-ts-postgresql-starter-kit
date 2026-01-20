import { SESSION_KEY } from "../constants/session";
import { config } from "../config";
import type { Response } from "express";

export class CookieUtility {
  static setSessionKey(
    res: Response,
    sessionKey: string
  ) {
    const isDev = config.serverType === "dev";
    res.cookie(
      SESSION_KEY,
      sessionKey,
      {
        httpOnly: true,
        secure: !isDev,
        sameSite: isDev ? "lax" : "none", // CORS 요청을 위해 개발환경은 lax, 프로덕션은 none
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