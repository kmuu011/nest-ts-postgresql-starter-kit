import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class ControllableExceptionFilter implements ExceptionFilter {
  async catch(exception: HttpException, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const response: any = exception.getResponse();
    const api = req.originalUrl;
    let error = response?.error;
    let message = response?.message;

    // message가 배열일 경우 문자열로 변환
    if (Array.isArray(message)) {
      message = message.join('\n');
    } else if (typeof message === 'string') {
      message = message.replace(/\,/g, '\n');
    } else {
      message = String(message);
    }

    console.log(`[ControllableExceptionFilter] ${api}`, exception);

    // HTTP 상태 코드가 유효하지 않은 경우 400으로 변경
    const httpStatus = (status >= 100 && status < 1000) ? status : 400;

    res
      .status(httpStatus)
      .json({
        statusCode: status, // 원본 상태 코드 유지
        httpStatus: httpStatus, // 실제 HTTP 상태 코드
        error,
        message,
      });
  }
}

@Catch()
export class OutOfControlExceptionFilter implements ExceptionFilter {
  async catch(exception: any, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const api = req.originalUrl;
    const status = exception?.status || 500;

    console.log(`[OutOfControlExceptionFilter] ${api}`, exception);

    if (status === 404) {
      res
        .status(status)
        .json({
          statusCode: status,
          error: 'not_found',
          message: '요청하신 url을 찾을 수 없습니다.',
        });
      return;
    }

    res
      .status(status)
      .json({
        statusCode: status,
        error: 'out_of_control_server_error',
        message: '지정되지 않은 오류가 발생했습니다.' +
          '\n빠른 시일 내에 수정 될 예정입니다.' +
          '\n이용해 주셔서 감사합니다.',
      });
  }
}