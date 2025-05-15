import { SetMetadata } from '@nestjs/common';

export const SKIP_COMMON_RESPONSE_KEY = 'skipCommonResponse';
export const SkipCommonResponse = () =>
  SetMetadata(SKIP_COMMON_RESPONSE_KEY, true);
