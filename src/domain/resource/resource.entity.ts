import { Entity, Column } from 'typeorm';
import { KstBaseEntity } from '../kst-base.entity';
import { ResourceDomain } from './enum/resource-domain.enum';

@Entity('resource')
export class Resource extends KstBaseEntity {
  @Column({ comment: '파일명 (원본 파일 이름)' })
  name: string;

  @Column({ type: 'bigint', comment: '파일 크기 (byte)' })
  length: number;

  @Column({ name: 'rsc_url', comment: 'S3 Key 또는 URL' })
  rscUrl: string;

  @Column({
    type: 'enum',
    enum: ResourceDomain,
    comment: '리소스를 사용하는 도메인',
  })
  domain: ResourceDomain;
}
