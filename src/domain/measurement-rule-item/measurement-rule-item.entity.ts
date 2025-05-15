import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MeasurementRule } from '../mesurement-rule/measurement-rule.entity';

@Entity('measurement_rule_item')
export class MeasurementRuleItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'rule_id' })
  ruleId: string;

  @ManyToOne(() => MeasurementRule, (rule) => rule.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'rule_id' })
  rule: MeasurementRule;

  @Column()
  category: string; // ex: 상의

  @Column()
  section: string; // ex: 몸통

  @Column()
  label: string; // ex: 가슴너비

  @Column()
  code: string; // ex: chest_width
}
