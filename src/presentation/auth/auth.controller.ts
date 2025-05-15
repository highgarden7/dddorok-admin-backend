import { Controller, Get, Param, Query, Redirect } from '@nestjs/common';
import { AuthService } from '../../application/auth/auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CustomException } from 'src/common/exception/custom.exception';
import { ErrorCode } from 'src/common/exception/error-code.enum';
import { Public } from 'src/common/decorator/public.decorator';
import { Authenticated } from 'src/common/decorator/authenticated';

@Authenticated()
@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * OAuth 로그인요청
   * Oauth에서 로그인 후 코드와 state를 전달하면 이를 처리하여 JWT 토큰을 발행합니다.
   */
  @Get('login/:provider')
  @Public()
  @ApiOperation({
    summary: 'OAuth 로그인',
    description:
      'provider OAuth 로그인으로 전달된 code를 처리하여 JWT 토큰을 발행합니다.',
  })
  @ApiResponse({
    status: 200,
    description: 'JWT 토큰 발행 성공',
    schema: {
      example: {
        code: 200,
        message: 'ok',
        data: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiQuery({ name: 'state', required: false, description: 'state 값' })
  async login(
    @Param('provider') provider: string,
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    if (!code) {
      throw new CustomException(
        'Missing code',
        'bad request',
        ErrorCode.BAD_REQUEST,
      );
    }
    switch (provider) {
      case 'naver':
        return this.authService.handleNaverCallback(code, state);
      case 'google':
        return this.authService.handleGoogleCallback(code, state);
      case 'kakao':
        return this.authService.handleKakaoCallback(code);
      default:
        throw new CustomException(
          'Unsupported provider',
          'bad request',
          ErrorCode.BAD_REQUEST,
        );
    }
  }

  /**
   * Refresh Token을 이용하여 Access Token 재발급
   */
  @Get('refresh-token')
  @Public()
  @ApiOperation({
    summary: 'Refresh Token 재발급',
    description: 'Refresh Token을 이용하여 Access Token을 재발급합니다.',
  })
  @ApiResponse({
    status: 200,
    description: 'JWT 토큰 발행 성공',
    schema: {
      example: {
        code: 200,
        message: 'ok',
        data: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  async tokenRefresh(@Query('refresh_token') refreshToken: string) {
    if (!refreshToken) {
      throw new CustomException(
        'Missing refresh token',
        'bad request',
        ErrorCode.BAD_REQUEST,
      );
    }
    return this.authService.refreshToken(refreshToken);
  }

  /**
   * 임시 토큰 발행 (테스트용)
   */
  @Get('test-token')
  @Public()
  @ApiOperation({
    summary: '로컬 테스트용 토큰 발행',
    description: '테스트용으로 임시 JWT 토큰을 발행합니다.',
  })
  @ApiResponse({
    status: 200,
    description: 'JWT 토큰 발행 성공',
    schema: {
      example: {
        code: 200,
        message: 'ok',
        data: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  async test_login() {
    const token = await this.authService.testLogin();

    return {
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
    };
  }
}
