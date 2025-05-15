// src/common/decorators/authenticated.ts
import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

export function Authenticated() {
  return applyDecorators(ApiBearerAuth('access-token'));
}