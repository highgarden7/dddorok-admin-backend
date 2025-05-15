/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
export enum ErrorCode {
  // 4xx Client Errors
  BAD_REQUEST = 400,

  UNAUTHORIZED = 401,
  UNAUTHORIZED_TOKEN_EXPIRED = 40101,
  UNAUTHORIZED_INVALID_TOKEN = 40102,
  UNAUTHORIZED_INVALID_CREDENTIAL = 40103,

  FORBIDDEN = 403,
  NOT_FOUND = 404,

  CONFLICT = 409,

  PAYLOAD_TOO_LARGE = 413,

  // 5xx Server Errors
  INTERNAL_SERVER_ERROR = 500,
}

export const ErrorMessageMap: { [key in ErrorCode]: string } = {
  // 4xx Client Errors
  // 400
  [ErrorCode.BAD_REQUEST]: '잘못된 요청입니다.',

  // 401
  [ErrorCode.UNAUTHORIZED]: '인증이 필요합니다.',
  [ErrorCode.UNAUTHORIZED_TOKEN_EXPIRED]: '토큰이 만료되었습니다.',
  [ErrorCode.UNAUTHORIZED_INVALID_TOKEN]: '유효하지 않은 토큰입니다.',
  [ErrorCode.UNAUTHORIZED_INVALID_CREDENTIAL]: '유효하지 않은 자격 증명입니다.',

  // 403
  [ErrorCode.FORBIDDEN]: '접근이 거부되었습니다.',

  // 404
  [ErrorCode.NOT_FOUND]: '찾을 수 없습니다.',

  // 409
  [ErrorCode.CONFLICT]: '충돌이 발생했습니다.',

  // 413
  [ErrorCode.PAYLOAD_TOO_LARGE]: '요청 페이로드가 너무 큽니다.',

  // 5xx Server Errors
  [ErrorCode.INTERNAL_SERVER_ERROR]: '서버 내부 오류가 발생했습니다.',
};
