import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from "./config";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import { OutOfControlExceptionFilter } from './common/filter/exception.filter';
import { ControllableExceptionFilter } from './common/filter/exception.filter';
import { NEW_SESSION_KEY, SESSION_KEY } from './constants/session';
import { NestExpressApplication } from '@nestjs/platform-express';

// BigInt를 JSON으로 직렬화할 수 있도록 전역 설정
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files
  app.useStaticAssets(config.staticPath, {
    prefix: '/static/',
  });

  app.enableCors({
    origin: [
      'http://127.0.0.1:3000',
      'http://localhost:3000',
      'http://192.168.0.74:8100',
    ],
    credentials: true, // 쿠키/인증정보 허용 시 필요
    methods: ['DELETE', 'GET', 'POST', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      SESSION_KEY,
      'user-agent',
      'x-forwarded-for',
      'Content-Type',
      'Origin',
      'Accept',
      'Authorization',
      'X-Requested-With',
      'Cookie',
    ],
    exposedHeaders: [
      NEW_SESSION_KEY,
    ],
  });

  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  app.setGlobalPrefix("api");

  // 예상 범위 밖의 예외 필터
  app.useGlobalFilters(new OutOfControlExceptionFilter());

  // 예상 범위 내의 예외 필터
  app.useGlobalFilters(new ControllableExceptionFilter());

  await app.listen(config.port ?? 8200);
}

bootstrap();
