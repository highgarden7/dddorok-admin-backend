import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from '../../domain/admin/admin.entity';
import { Repository } from 'typeorm';
import { CustomException } from 'src/common/exception/custom.exception';
import { ErrorCode } from 'src/common/exception/error-code.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly userRepository: Repository<Admin>,
  ) {}

  // 유저 고유 id를 기준으로 사용자 조회
  async findById(id: string): Promise<Admin | undefined> {
    return await this.userRepository.findOne({ where: { id: id } });
  }

  // refreshToken을 기준으로 사용자 조회
  async findByRefreshToken(refreshToken: string): Promise<Admin | undefined> {
    return await this.userRepository.findOne({
      where: { refreshToken: refreshToken },
    });
  }

  // 네이버 고유 id를 기준으로 사용자 조회
  async findByNaverId(id: string): Promise<Admin | undefined> {
    return await this.userRepository.findOne({ where: { naverId: id } });
  }

  // 네이버 사용자 정보로 신규 사용자 생성
  async createUserFromNaver(naverUserData: any): Promise<Admin> {
    // 예시: User 엔티티에 naverId, username 등을 저장한다고 가정합니다.
    const user = this.userRepository.create({
      naverId: naverUserData.id,
    });
    return await this.userRepository.save(user);
  }

  // 구글 사용자 정보로 신규 사용자 생성
  async findByGoogleId(id: any) {
    return this.userRepository.findOne({ where: { googleId: id } });
  }

  // 구글 고유 id를 기준으로 사용자 조회
  async createUserFromGoogle(googleUserData: any): Promise<Admin> | undefined {
    const user = this.userRepository.create({
      googleId: googleUserData.id,
    });
    return await this.userRepository.save(user);
  }

  // 카카오 사용자 정보로 신규 사용자 생성
  async createUserFromKakao(kakaoUserData: any): Promise<Admin> {
    const user = this.userRepository.create({
      kakaoId: kakaoUserData.id,
    });
    return await this.userRepository.save(user);
  }

  // 카카오 고유 id를 기준으로 사용자 조회
  async findByKakaoId(id: any): Promise<Admin> | undefined {
    return this.userRepository.findOne({ where: { kakaoId: id } });
  }

  // 유저의 refreshToken을 DB에 저장
  async saveRefreshToken(id: string, refreshToken: string): Promise<void> {
    const result = await this.userRepository.update(id, { refreshToken });
    if (result.affected === 0) {
      throw new CustomException(
        'Failed to save refresh token',
        'update error',
        ErrorCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
