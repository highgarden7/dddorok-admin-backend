import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { KstBaseEntity } from '../kst-base.entity';
import { ChartSection } from './enum/chart-section.enum';
import { ChartPartDetail } from './enum/chart-part-detail.enum';
import { ChartTypeCodeMap } from './chart-type-code-map.entity';
import { Resource } from '../resource/resource.entity';
import { TemplateChartTypeMap } from '../template/template-chart-type-map.entity';

@Entity('chart_type')
@Unique(['categoryLarge', 'categoryMedium', 'section', 'detailType'])
export class ChartType extends KstBaseEntity {
  @Column()
  name: string; // 예: 앞몸판, 뒷몸판, 소매, 후드 등

  @Column()
  categoryLarge: string; // 예: 의류, 가방, 신발 등

  @Column()
  categoryMedium: string; // 예: 상의, 하의, 아우터 등

  @Column()
  section: ChartSection; // 예: 몸판, 소매 등

  @Column()
  detailType: ChartPartDetail; // 예: 앞몸판, 뒷몸판, 상단 전개도, 하단 전개도 등

  @Column({ nullable: true })
  measurementItemId: string; // 측정항목 id (optional)

  @OneToMany(() => ChartTypeCodeMap, (codeMap) => codeMap.chartType, {
    cascade: true,
    eager: false,
  })
  codeMaps: ChartTypeCodeMap[];

  @ManyToOne(() => Resource, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'svg_file_id' })
  svgFile?: Resource;

  @Column({ name: 'svg_file_id' })
  svgFileId: string;

  @OneToMany(() => TemplateChartTypeMap, (map) => map.chartType, {
    cascade: false,
  })
  templateMaps: TemplateChartTypeMap[];
}
