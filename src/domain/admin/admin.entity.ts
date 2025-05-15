import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  BeforeInsert,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('admin')
@Unique(['userName'])
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedDate: Date;

  // user_name은 "유저_" + id 로 설정할 예정
  @Column()
  userName: string;

  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true })
  naverId: string;

  @Column({ nullable: true })
  kakaoId: string;

  // refreshToken
  @Column({ nullable: true })
  refreshToken: string;

  // 엔티티가 저장되기 전 자동으로 user_name 설정 (id가 이미 생성된 후에 호출되지 않을 수 있으므로, 별도 처리 필요)
  @BeforeInsert()
  setUserName() {
    // 사용자 이름은 "유저_"와 랜덤 uuid 문자열을 조합해 생성합니다.
    const shortUuid = uuidv4().replace(/-/g, '').slice(0, 6);
    this.userName = `admin_${shortUuid}`;
  }
}
