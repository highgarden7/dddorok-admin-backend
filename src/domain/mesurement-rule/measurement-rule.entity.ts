import { Entity, Column, Unique, OneToMany } from 'typeorm';
import { MeasurementRuleItem } from '../measurement-rule-item/measurement-rule-item.entity';
import { Template } from '../template/template.entity';
import { KstBaseEntity } from '../kst-base.entity';
import { SleeveType } from './enum/sleeve-type.enum';
import { NeckLineType } from './enum/neck-line-type.enum';

@Entity('measurement_rule')
@Unique(['categorySmall', 'sleeveType', 'neckLineType'])
export class MeasurementRule extends KstBaseEntity {
  @Column()
  categoryLarge: string;

  @Column()
  categoryMedium: string;

  @Column()
  categorySmall: string;

  @Column({ type: 'enum', enum: SleeveType, default: SleeveType.NONE })
  sleeveType: SleeveType;

  @Column({ type: 'enum', enum: NeckLineType, default: NeckLineType.NONE })
  neckLineType: NeckLineType;

  @Column({ unique: true })
  ruleName: string;

  @OneToMany(() => MeasurementRuleItem, (item) => item.rule, { cascade: true })
  items: MeasurementRuleItem[];

  @OneToMany(() => Template, (template) => template.measurementRule)
  templates: Template[];
}
