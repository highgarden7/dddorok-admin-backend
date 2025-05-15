import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { isObservable, lastValueFrom } from 'rxjs';
import { IS_PUBLIC_KEY } from 'src/common/decorator/public.decorator';
import { CustomException } from '../exception/custom.exception';
import { ErrorCode } from '../exception/error-code.enum';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const result = super.canActivate(context);
    return isObservable(result) ? await lastValueFrom(result) : await result;
  }

  handleRequest(err, user, info) {
    if (!info && !user) {
      throw new CustomException(
        undefined,
        'UNAUTHORIZED',
        ErrorCode.UNAUTHORIZED,
      );
    }

    if (info instanceof TokenExpiredError) {
      throw new CustomException(
        undefined,
        'TOKEN_EXPIRED',
        ErrorCode.UNAUTHORIZED_TOKEN_EXPIRED,
      );
    }

    if (info instanceof JsonWebTokenError) {
      throw new CustomException(
        undefined,
        'INVALID_TOKEN',
        ErrorCode.UNAUTHORIZED_INVALID_TOKEN,
      );
    }

    if (err || !user) {
      throw new CustomException(
        undefined,
        'UNAUTHORIZED',
        ErrorCode.UNAUTHORIZED,
      );
    }

    return user;
  }
}
