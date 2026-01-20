import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { config } from '@/config';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const startTime = Date.now();

    // 응답 완료 시 로그 출력 및 DB 저장
    res.on('finish', async () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const responseTime = Date.now() - startTime;

      // dev 환경일 때만 콘솔 로그 출력
      if (config.serverType === 'dev') {
        this.logger.log(
          `${method} ${originalUrl} ${statusCode} ${contentLength || 0}b ${responseTime}ms - ${ip}`
        );
      }

    });

    next();
  }
}
