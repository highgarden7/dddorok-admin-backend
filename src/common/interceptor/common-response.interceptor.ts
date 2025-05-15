import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { SKIP_COMMON_RESPONSE_KEY } from '../decorator/skip-common-response.decorator';
import { Reflector } from '@nestjs/core';

import * as _ from 'lodash';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

function keysToSnakeCase(obj: any): any {
  if (obj instanceof Date) {
    return dayjs(obj).format('YYYY-MM-DD HH:mm:ss');
  }

  if (Array.isArray(obj)) {
    return obj.map((v) => keysToSnakeCase(v));
  }

  if (obj && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = _.snakeCase(key);
      acc[snakeKey] = keysToSnakeCase(obj[key]);
      return acc;
    }, {});
  }

  return obj;
}

@Injectable()
export class CommonResponseInterceptor<T> implements NestInterceptor<T, any> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 핸들러에 SKIP_COMMON_RESPONSE_KEY 메타데이터가 설정되어 있으면, 변환하지 않고 그대로 반환
    const skip = this.reflector.getAllAndOverride<boolean>(
      SKIP_COMMON_RESPONSE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (skip) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => ({
        code: 200,
        message: 'ok',
        data: keysToSnakeCase(data),
      })),
    );
  }
}
