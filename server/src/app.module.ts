import {Global, MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import {MemberModule} from "./modules/member/member.module";
import {PrismaService} from "./common/prisma/prisma.service";
import {CacheModule} from "@nestjs/cache-manager";
import {CacheService} from "./common/cache/cache.service";
import {createKeyv } from '@keyv/redis';
import {config} from "./config";

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
  ],
  providers: [
    PrismaService,
    CacheService,
  ],
  exports: [
    PrismaService,
    CacheService,
  ],
}

@Global()
@Module(moduleMetaData)
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    // API 호출 로깅 미들웨어
    // consumer.apply(LoggerMiddleware).forRoutes('*');

    // 데이터 파싱 미들웨어
    // consumer.apply(PrefixMiddleware).forRoutes('*');
  }
}
