import { Injectable } from "@nestjs/common";
import { CacheService } from "../cache/cache.service";
import { config } from "../../config";

@Injectable()
export class SessionService {
  constructor(
    private readonly cacheService: CacheService
  ) {
  }

  async create(
    memberIdx: number,
    userAgent: string,
    keepLogin: boolean = false
  ) {
    const sessionKey = await this.cacheService.getUnqKey(43);

    const sessionData = {
      memberIdx,
      userAgent,
      keepLogin
    };

    await this.cacheService.set(
      sessionKey,
      sessionData,
      config.memberAuth.session.expireTime
    );

    return sessionKey;
  }

  async get(
    sessionKey: string
  ) {
    return {
      ...(await this.cacheService.get(sessionKey)),
      ttl: await this.cacheService.ttl(sessionKey)
    };
  }
}