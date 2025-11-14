import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import cookieParser from 'cookie-parser';
import { OutOfControlExceptionFilter, ControllableExceptionFilter } from '../../src/common/filter/exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { config } from '../../src/config';

let app: NestExpressApplication;

export async function createTestApp(): Promise<NestExpressApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication<NestExpressApplication>();

  // 실제 앱과 동일한 설정 적용
  app.useStaticAssets(config.staticPath, {
    prefix: '/static/',
  });

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.setGlobalPrefix('api');

  app.useGlobalFilters(new OutOfControlExceptionFilter());
  app.useGlobalFilters(new ControllableExceptionFilter());

  await app.init();

  return app;
}

export async function closeTestApp() {
  if (app) {
    await app.close();
  }
}

export function getTestApp(): NestExpressApplication {
  return app;
}
