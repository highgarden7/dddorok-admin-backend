import {
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  PrimaryGeneratedColumn,
} from 'typeorm';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export abstract class KstBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @BeforeInsert()
  setCreateDateKST() {
    const now = dayjs().tz('Asia/Seoul').toDate();
    this.createdDate = now;
    this.updatedDate = now;
  }

  @BeforeUpdate()
  setUpdateDateKST() {
    this.updatedDate = dayjs().tz('Asia/Seoul').toDate();
  }
}
