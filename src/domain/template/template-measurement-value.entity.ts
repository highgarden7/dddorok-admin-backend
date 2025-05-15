import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Template } from './template.entity';

@Entity('template_measurement_value')
export class TemplateMeasurementValue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Template, (template) => template.measurementValues, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'template_id' })
  template: Template;

  @Column()
  templateId: string;

  @Column()
  label: string;

  @Column()
  code: string;

  // 고정된 사이즈 구간별 수치 컬럼
  @Column({ type: 'float', nullable: true, default: null }) size_50_53: number;
  @Column({ type: 'float', nullable: true, default: null }) size_54_57: number;
  @Column({ type: 'float', nullable: true, default: null }) size_58_61: number;
  @Column({ type: 'float', nullable: true, default: null }) size_62_65: number;
  @Column({ type: 'float', nullable: true, default: null }) size_66_69: number;
  @Column({ type: 'float', nullable: true, default: null }) size_70_73: number;
  @Column({ type: 'float', nullable: true, default: null }) size_74_79: number;
  @Column({ type: 'float', nullable: true, default: null }) size_80_84: number;
  @Column({ type: 'float', nullable: true, default: null }) size_85_89: number;
  @Column({ type: 'float', nullable: true, default: null }) size_90_94: number;
  @Column({ type: 'float', nullable: true, default: null }) size_95_99: number;
  @Column({ type: 'float', nullable: true, default: null })
  size_100_104: number;
  @Column({ type: 'float', nullable: true, default: null })
  size_105_109: number;
  @Column({ type: 'float', nullable: true, default: null })
  size_110_114: number;
  @Column({ type: 'float', nullable: true, default: null })
  size_115_120: number;
  @Column({ type: 'float', nullable: true, default: null })
  size_121_129: number;

  // 사용자 조정 가능 범위
  @Column({ type: 'float', nullable: true, default: null })
  min: number;

  @Column({ type: 'float', nullable: true, default: null })
  max: number;

  @Column({ type: 'boolean', default: false })
  rangeToggle: boolean;
}
