import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { MeasurementRule } from '../mesurement-rule/measurement-rule.entity';
import { NeedleType } from './enum/needle-type.enum';
import { ChartType } from './enum/chart-type.enum';
import { ConstructionMethod } from './enum/construction-method.enum';
import { TemplateMeasurementValue } from './template-measurement-value.entity';
import { KstBaseEntity } from '../kst-base.entity';
import { TemplateChartTypeMap } from './template-chart-type-map.entity';

@Entity('template')
export class Template extends KstBaseEntity {
  @Column()
  name: string;

  @Column({ type: 'enum', enum: NeedleType, default: NeedleType.NONE })
  needleType: NeedleType;

  @Column({ type: 'enum', enum: ChartType, default: ChartType.NONE })
  chartType: ChartType;

  @Column({ default: false })
  isPublished: boolean;

  @ManyToOne(() => MeasurementRule)
  @JoinColumn({ name: 'measurement_rule_id' })
  measurementRule: MeasurementRule;

  @Column()
  measurementRuleId: string;

  @Column({
    type: 'enum',
    enum: ConstructionMethod,
    array: true,
    default: [ConstructionMethod.NONE],
  })
  constructionMethods: ConstructionMethod[];

  @OneToMany(() => TemplateMeasurementValue, (value) => value.template, {
    cascade: true,
  })
  measurementValues: TemplateMeasurementValue[];

  @OneToMany(() => TemplateChartTypeMap, (map) => map.template, {
    cascade: false,
  })
  chartTypeMaps: TemplateChartTypeMap[];
}
