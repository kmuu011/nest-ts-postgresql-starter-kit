import type {Request} from "express";

export class Utility {
  static getClientInfo = (req: Request) => {
    const {
      "user-agent": userAgent,
    } = req.headers;
    const ip = (req.headers["x-forwarded-for"] || req.headers.ip) || '';
    const filteredIp = ip.constructor !== String ? (ip[0] || '') : ip;
    const filteredUserAgent = userAgent || '';

    return {
      ip: filteredIp,
      userAgent: filteredUserAgent,
    }
  }
}