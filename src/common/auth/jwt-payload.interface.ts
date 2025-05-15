export interface JwtPayload {
  sub: string; // 사용자 고유 ID
  username: string; // 사용자명 또는 이메일
}
