import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { config } from "../../config";
import { StringUtility } from "../utils/StringUtility";

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
  }

  private patternToRegex(pattern: string): RegExp {
    const escaped = pattern.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&');
    const regexString = '^' + escaped.replace(/\*/g, '.*') + '$';
    return new RegExp(regexString);
  }

  async set<T = any>(key: string, value: T, ttl = config.redis.defaultTTL): Promise<void> {
    await this.cacheManager.set(key, value, ttl * 1000);
  }

  async get<T = any>(key: string): Promise<T | null> {
    const v = await this.cacheManager.get<T>(key);
    return v ?? null;
  }

  async ttl(key: string): Promise<number | null> {
    return await this.cacheManager.ttl(key) ?? null;
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async keys(pattern = '*'): Promise<any> {
    const stores: any[] = (this.cacheManager as any).stores;

    if (!stores.length) return [];

    const store = stores[0];
    const matcher = this.patternToRegex(pattern);
    const result: string[] = [];

    for await (const [key] of store.iterator()) {
      if (matcher.test(key)) {
        result.push(key);
      }
    }

    return result;
  }

  async getUnqKey(length = 32): Promise<string> {
    while (true) {
      const key = StringUtility.createRandomString(length, true, true);
      const exists = await this.cacheManager.get(key);
      if (exists == null) return key;
    }
  }
}
