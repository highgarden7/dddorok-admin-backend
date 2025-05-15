import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { MeasurementCode } from './enum/measurement-item-code.enum';

@Entity({ name: 'measurement_rule_code' })
export class MeasurementItemCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ comment: '카테고리 (상의, 하의 등)' })
  category: string;

  @Column({ comment: '부위 파트 (몸통, 소매 등)' })
  section: string;

  @Column({ comment: '항목명 (국문)' })
  label: string;

  @Column({
    type: 'enum',
    enum: MeasurementCode,
    unique: true,
    comment: '항목 고유 코드값 (계산 및 매핑용)',
  })
  code: MeasurementCode;
}
