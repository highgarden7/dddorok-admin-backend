import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Template } from './template.entity';
import { ChartType } from '../chart-type/chart-type.entity';

@Entity('template_chart_type_map')
export class TemplateChartTypeMap {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Template, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'template_id' })
  template: Template;

  @Column({ name: 'template_id' })
  templateId: string;

  @ManyToOne(() => ChartType, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chart_type_id' })
  chartType: ChartType;

  @Column({ name: 'chart_type_id' })
  chartTypeId: string;

  @Column({ name: 'order', default: -1 })
  order: number;
}
