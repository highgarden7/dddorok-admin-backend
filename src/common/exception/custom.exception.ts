import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode, ErrorMessageMap } from './error-code.enum';

export class CustomException extends HttpException {
  constructor(
    customMessage?: string,
    customError?: string,
    code: ErrorCode = ErrorCode.BAD_REQUEST,
  ) {
    const message = customMessage || ErrorMessageMap[code];
    const errorText = customError || message;

    // code 앞 3자리 추출 → 40102 → 401, 50001 → 500
    const status =
      code >= 100 && code < 600
        ? code // 3자리면 그대로 사용
        : Math.floor(code / 100); // 40102 → 401

    super({ message, error: errorText, code }, status);
  }
}
