import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from "./config";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import { OutOfControlExceptionFilter } from './common/filter/exception.filter';
import { ControllableExceptionFilter } from './common/filter/exception.filter';
import { NEW_SESSION_KEY, SESSION_KEY } from './constants/session';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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
      'http://192.168.0.75:3000',
      'http://192.168.0.74:3000',
      'http://192.168.0.75:8200',
      'http://192.168.0.74:8200',
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
      'is-admin',
      'timezone-offset'
    ],
    exposedHeaders: [
      NEW_SESSION_KEY,
    ],
  });

  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  app.setGlobalPrefix("api");

  // Swagger 설정
  const swaggerConfig = new DocumentBuilder()
    .setTitle('NestJS PostgreSQL Starter Kit API')
    .setDescription('API documentation for NestJS PostgreSQL Starter Kit')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: SESSION_KEY,
        in: 'header',
        description: 'Session key for authentication',
      },
      'session-key',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // 예상 범위 밖의 예외 필터
  app.useGlobalFilters(new OutOfControlExceptionFilter());

  // 예상 범위 내의 예외 필터
  app.useGlobalFilters(new ControllableExceptionFilter());

  await app.listen(config.port ?? 8200);

  console.log(`Application is running on: http://localhost:${config.port ?? 8200}`);
  console.log(`Swagger documentation: http://localhost:${config.port ?? 8200}/api/docs`);
}

bootstrap();
