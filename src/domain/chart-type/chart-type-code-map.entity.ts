import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ChartType } from './chart-type.entity';

@Entity('chart_type_code_map')
export class ChartTypeCodeMap {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  measurementCode: string; // 측정 코드 (예: chest_width, sleeve_length 등)

  @Column()
  pathId: string; // SVG의 path ID (예: BODY_SHOULDER_SLOPE_WIDTH)

  @ManyToOne(() => ChartType, (chartType) => chartType.codeMaps, {
    onDelete: 'CASCADE',
    eager: false,
  })
  chartType: ChartType;
}
