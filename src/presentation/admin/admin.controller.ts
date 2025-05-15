import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExcludeController,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Authenticated } from 'src/common/decorator/authenticated';
import { Public } from 'src/common/decorator/public.decorator';

@ApiExcludeController() // Swagger UI에서 제외
@Authenticated()
@Controller('admin')
@ApiTags('Admin') // Swagger UI에서 그룹화에 사용됨
export class AdminController {
  constructor() {}

  @Get('test')
  @Public()
  @ApiOperation({
    summary: '테스트 엔드포인트',
    description: '테스트용 엔드포인트입니다.',
  })
  @ApiResponse({
    status: 200,
    description: '테스트 성공',
    schema: {
      example: {
        code: 200,
        data: [{ message: '테스트 성공' }],
      },
    },
  })
  test() {
    return { message: '테스트 성공' };
  }

  @Get('test/login')
  @ApiOperation({
    summary: '로그인 테스트 엔드포인트',
    description: '로그인 테스트용 엔드포인트입니다.',
  })
  @ApiResponse({
    status: 200,
    description: '로그인 테스트 성공',
    schema: {
      example: {
        code: 200,
        data: [{ message: '로그인 테스트 성공' }],
      },
    },
  })
  @ApiBearerAuth('access-token')
  loginTest() {
    return { message: '로그인 테스트 성공' };
  }
}
