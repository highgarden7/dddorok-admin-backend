import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MulterError } from 'multer';
import { ErrorCode } from './error-code.enum';

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    console.error(`[${request.method}] ${request.url}`, exception);

    // 기본 상태 코드는 500 (Internal Server Error)
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: any = {
      code: status,
      message: 'Internal server error',
      error: 'Internal server error',
    };

    // ✅ Multer 파일 업로드 예외 처리
    if (exception instanceof MulterError) {
      errorResponse = {
        code: ErrorCode.PAYLOAD_TOO_LARGE,
        message:
          exception.code === 'LIMIT_FILE_SIZE'
            ? '업로드 가능한 최대 파일 크기는 5MB입니다.'
            : '파일 업로드 중 오류가 발생했습니다.',
        error: exception.code,
      };
    }
    // ✅ Nest HttpException
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        errorResponse = {
          code: status,
          message: res,
          error: exception.message,
        };
      } else if (typeof res === 'object' && res !== null) {
        errorResponse = {
          code: (res as any).code || status,
          message: (res as any).message || exception.message,
          error: (res as any).error || exception.message,
        };
      }
    }
    // ✅ 일반 JS Error
    else if (exception instanceof Error) {
      errorResponse = {
        code: status,
        message: exception.message,
        error: exception.name,
      };
    }

    response.status(status).json({
      ...errorResponse,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
