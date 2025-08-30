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
    userAgent: string
  ) {
    const sessionId = await this.cacheService.getUnqKey(43);

    const sessionData = {
      memberIdx,
      userAgent
    };

    await this.cacheService.set(
      sessionId,
      sessionData,
      config.memberAuth.session.expireTime
    );

    return sessionId;
  }

  async get(
    sessionId: string
  ) {
    return {
      ...(await this.cacheService.get(sessionId)),
      ttl: await this.cacheService.ttl(sessionId)
    };
  }
}