import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MemberModule } from "./modules/member/member.module";
import { CacheModule } from "@nestjs/cache-manager";
import { CacheService } from "./common/cache/cache.service";
import { createKeyv } from '@keyv/redis';
import { config } from "./config";
import { MemoModule } from './modules/memo/memo.module';
import { SessionService } from './common/session/session.service';
import { MemberRepository } from './modules/member/member.repository';
import { PrismaService } from "./common/prisma/prisma.service";
import { LoggerMiddleware } from './common/middleware/logger.middleware';

const moduleMetaData = {
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        stores: [
          createKeyv(`redis://${config.redis.host}:${config.redis.port}`)
        ]
      })
    }),
    MemberModule,
    MemoModule,
  ],
  providers: [
    PrismaService,
    CacheService,
    SessionService,
    MemberRepository
  ],
  exports: [
    PrismaService,
    CacheService,
    SessionService,
    MemberRepository
  ],
}

@Global()
@Module(moduleMetaData)
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    // API 호출 로깅 미들웨어
    consumer.apply(LoggerMiddleware).forRoutes('*');

    // 데이터 파싱 미들웨어
    // consumer.apply(PrefixMiddleware).forRoutes('*');
  }
}
