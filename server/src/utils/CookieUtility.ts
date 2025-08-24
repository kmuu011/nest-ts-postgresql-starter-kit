import {config} from "../config";
import {Response} from "express";
import {SESSION_ID_KEY} from "../constants/session";

export class CookieUtility {
  static setSessionId(
    res: Response,
    sessionId: string
  ) {
    res.cookie(
      SESSION_ID_KEY,
      sessionId,
      {
        httpOnly: true,
        secure: globalThis.SERVER_TYPE !== "dev",
        sameSite: "strict",
        maxAge: config.memberAuth.session.expireTime * 1000
      }
    )
  }

  static deleteSessionId(
    res: Response,
  ) {
    res.clearCookie(SESSION_ID_KEY);
  }
}