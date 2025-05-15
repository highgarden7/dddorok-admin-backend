import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'; // state 생성용
import { AdminService } from '../admin/admin.service';
import { CustomException } from 'src/common/exception/custom.exception';
import { ErrorCode } from 'src/common/exception/error-code.enum';
import { Admin } from 'src/domain/admin/admin.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly adminService: AdminService,
  ) {}

  /**
   * 네이버 OAuth 콜백 처리
   * 1. 네이버 토큰 엔드포인트에 code, state 등 전달하여 액세스 토큰 획득
   * 2. 획득한 액세스 토큰을 사용해 사용자 정보 조회
   * 3. DB에 해당 사용자(네이버 고유 아이디)가 존재하는지 확인; 없으면 신규 회원 가입
   * 4. JWT accessToken (6시간)과 refreshToken (30일)을 발행하여 반환
   */
  async handleNaverCallback(
    code: string,
    state: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // 1. 네이버 토큰 요청
      const tokenResponse = await axios.get(
        'https://nid.naver.com/oauth2.0/token',
        {
          params: {
            grant_type: 'authorization_code',
            client_id: process.env.NAVER_CLIENT_ID,
            client_secret: process.env.NAVER_CLIENT_SECRET,
            code,
            state,
          },
        },
      );
      const naverTokenData = tokenResponse.data;
      if (!naverTokenData.access_token) {
        throw new UnauthorizedException(
          'Failed to retrieve access token from Naver',
        );
      }
      const naverAccessToken = naverTokenData.access_token;

      // 2. 네이버 사용자 정보 조회
      const userResponse = await axios.get(
        'https://openapi.naver.com/v1/nid/me',
        {
          headers: {
            Authorization: `Bearer ${naverAccessToken}`,
          },
        },
      );

      const naverUserData = userResponse.data.response;
      if (!naverUserData) {
        throw new UnauthorizedException(
          'Failed to retrieve user information from Naver',
        );
      }

      // 3. 사용자 DB 처리: 네이버 고유 id (예: naverUserData.id)를 기준으로 사용자 검색
      let user = await this.adminService.findByNaverId(naverUserData.id);
      if (!user) {
        // 신규 사용자라면, 네이버 정보로 회원가입 처리 (필요한 추가 정보는 네이버 API 문서 참고)
        user = await this.adminService.createUserFromNaver(naverUserData);
      }

      // 4. JWT 토큰 발행
      return await this.issueTokens(user);
    } catch (error) {
      console.error(
        'Error in handleNaverCallback:',
        error.response ? error.response.data : error.message,
      );
      throw new InternalServerErrorException(
        'Naver OAuth authentication failed',
      );
    }
  }

  /**
   * Google OAuth 콜백 처리
   */
  async handleGoogleCallback(
    code: string,
    state: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // 1. 코드 교환을 통해 액세스 토큰 획득 (POST 요청)
      const tokenResponse = await axios.post(
        'https://oauth2.googleapis.com/token',
        null,
        {
          params: {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            code,
            redirect_uri: process.env.GOOGLE_REDIRECT_URL,
            grant_type: 'authorization_code',
          },
        },
      );
      const googleTokenData = tokenResponse.data;
      if (!googleTokenData.access_token) {
        throw new UnauthorizedException(
          'Failed to retrieve access token from Google',
        );
      }
      const googleAccessToken = googleTokenData.access_token;

      // 2. Google 사용자 정보 조회
      const userResponse = await axios.get(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: {
            Authorization: `Bearer ${googleAccessToken}`,
          },
        },
      );

      const googleUserData = userResponse.data;
      if (!googleUserData || !googleUserData.id) {
        throw new UnauthorizedException(
          'Failed to retrieve user information from Google',
        );
      }

      // 3. DB 처리: Google 고유 id(googleUserData.id)를 기준으로 사용자 검색; 없으면 신규 회원 가입
      let user = await this.adminService.findByGoogleId(googleUserData.id);
      if (!user) {
        user = await this.adminService.createUserFromGoogle(googleUserData);
      }

      // 4. JWT 토큰 발행
      return await this.issueTokens(user);
    } catch (error) {
      console.error(
        'Error in handleGoogleCallback:',
        error.response ? error.response.data : error.message,
      );
      throw new InternalServerErrorException(
        'Google OAuth authentication failed',
      );
    }
  }

  /**
   * 카카오 OAuth 콜백 처리
   */
  async handleKakaoCallback(
    code: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // 1. 카카오 토큰 요청
      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('client_id', process.env.KAKAO_CLIENT_ID);
      params.append('redirect_uri', process.env.KAKAO_REDIRECT_URL);
      params.append('code', code);

      const tokenResponse = await axios.post(
        'https://kauth.kakao.com/oauth/token',
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        },
      );

      const kakaoTokenData = tokenResponse.data;
      if (!kakaoTokenData.access_token) {
        throw new UnauthorizedException(
          'Failed to retrieve access token from Kakao',
        );
      }
      const kakaoAccessToken = kakaoTokenData.access_token;

      // 2. 카카오 사용자 정보 조회
      const userResponse = await axios.get(
        'https://kapi.kakao.com/v2/user/me',
        {
          headers: {
            Authorization: `Bearer ${kakaoAccessToken}`,
          },
        },
      );

      const kakaoUserData = userResponse.data;
      if (!kakaoUserData || !kakaoUserData.id) {
        throw new UnauthorizedException(
          'Failed to retrieve user information from Kakao',
        );
      }

      // 3. DB 처리: 카카오 고유 id(kakaoUserData.id)를 기준으로 사용자 검색; 없으면 신규 회원 가입
      let user = await this.adminService.findByKakaoId(kakaoUserData.id);
      if (!user) {
        user = await this.adminService.createUserFromKakao(kakaoUserData);
      }

      // 4. JWT 토큰 발행
      return await this.issueTokens(user);
    } catch (error) {
      console.error(
        'Error in handleKakaoCallback:',
        error.response ? error.response.data : error.message,
      );
      throw new InternalServerErrorException(
        'Kakao OAuth authentication failed',
      );
    }
  }

  async refreshToken(oldRefreshToken: string) {
    // refreshToken 검증
    try {
      const decoded = this.jwtService.verify(oldRefreshToken);
      if (!decoded) {
        throw new CustomException(
          'Invalid refresh token',
          'unauthorized',
          ErrorCode.UNAUTHORIZED,
        );
      }
    } catch (error) {
      throw new CustomException(
        'Invalid refresh token',
        'unauthorized',
        ErrorCode.UNAUTHORIZED,
      );
    }

    const user = await this.adminService.findByRefreshToken(oldRefreshToken);
    if (!user) {
      throw new CustomException(
        'Invalid refresh token',
        'unauthorized',
        ErrorCode.UNAUTHORIZED,
      );
    }
    const payload = {
      sub: user.id,
      username: user.userName,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '6h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    await this.adminService.saveRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async testLogin(): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.adminService.findById(
      '06e5c50b-bbab-4e7d-a490-3189d86494c1',
    );

    const payload = {
      sub: user.id,
      username: user.userName,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '6h' });
    const refreshToken = this.jwtService.sign({}, { expiresIn: '30d' });

    await this.adminService.saveRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async issueTokens(
    admin: Admin,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: admin.id,
      username: admin.userName,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '6h' });
    const refreshToken = this.jwtService.sign({}, { expiresIn: '30d' });

    await this.adminService.saveRefreshToken(admin.id, refreshToken);

    return { accessToken, refreshToken };
  }

  /**
   * state 값을 생성하여 CSRF 보호에 활용합니다.
   */
  generateState(): string {
    return uuidv4();
  }
}
