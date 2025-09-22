import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from "./config";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import { OutOfControlExceptionFilter } from './common/filter/exception.filter';
import { ControllableExceptionFilter } from './common/filter/exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://127.0.0.1:3000',
      'http://localhost:3000',
    ],
    credentials: true, // 쿠키/인증정보 허용 시 필요
    methods: ['DELETE', 'GET', 'POST', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'sessionId',
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
      'newSessionId',
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
