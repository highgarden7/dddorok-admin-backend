import { Expose, Transform, Type } from 'class-transformer';
import { ConstructionMethod } from 'src/domain/template/enum/construction-method.enum';
import { NeedleType } from 'src/domain/template/enum/needle-type.enum';
import { ChartType } from 'src/domain/template/enum/chart-type.enum';
import { MeasurementRuleResponseDto } from 'src/presentation/measurement-rule/dto/measurement-rule-response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ChartTypeSimpleDto {
  @ApiProperty({ description: '차트 유형 ID', format: 'uuid' })
  @Expose()
  id: string;

  @ApiProperty({ description: '차트 이름' })
  @Expose()
  name: string;

  @ApiProperty({ description: '순서' })
  @Expose()
  order: number;
}

export class TemplateResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  needleType: string;

  @Expose()
  patternType: string;

  @Expose()
  isPublished: boolean;

  @Expose()
  measurementRuleId: string;

  @Expose()
  constructionMethods: string[];

  @Expose()
  @Transform(({ value }) => value?.toISOString(), { toPlainOnly: true })
  createdDate: Date;

  @Expose()
  @Transform(({ value }) => value?.toISOString(), { toPlainOnly: true })
  updatedDate: Date;

  @ApiProperty({
    description: '연결된 차트 유형 리스트',
    type: [ChartTypeSimpleDto],
  })
  @Expose()
  @Type(() => ChartTypeSimpleDto)
  chartTypes: ChartTypeSimpleDto[];
}

export class TemplateListResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  needleType: NeedleType;

  @Expose()
  chartType: ChartType;

  @Expose()
  constructionMethods: ConstructionMethod[];

  @Expose()
  isPublished: boolean;

  @Expose()
  measurementRuleId: string;

  @ApiProperty({
    description: '연결된 차트 유형 리스트',
    type: [ChartTypeSimpleDto],
  })
  @Expose()
  @Type(() => ChartTypeSimpleDto)
  chartTypes: ChartTypeSimpleDto[];
}

export class TemplateDetailResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  needleType: string;

  @Expose()
  chartType: string;

  @Expose()
  isPublished: boolean;

  @Expose()
  constructionMethods: string[];

  @Expose()
  chartTypesids: string[];

  @Expose()
  @Type(() => MeasurementRuleResponseDto)
  measurementRule: MeasurementRuleResponseDto;

  @ApiProperty({
    description: '연결된 차트 유형 리스트',
    type: [ChartTypeSimpleDto],
  })
  @Expose()
  @Type(() => ChartTypeSimpleDto)
  chartTypes: ChartTypeSimpleDto[];
}

export class TemplateMeasurementValueResponseDto {
  @Expose()
  id: string;

  @Expose()
  label: string;

  @Expose()
  code: string;

  @Expose()
  size_50_53: number;

  @Expose()
  size_54_57: number;

  @Expose()
  size_58_61: number;

  @Expose()
  size_62_65: number;

  @Expose()
  size_66_69: number;

  @Expose()
  size_70_73: number;

  @Expose()
  size_74_79: number;

  @Expose()
  size_80_84: number;

  @Expose()
  size_85_89: number;

  @Expose()
  size_90_94: number;

  @Expose()
  size_95_99: number;

  @Expose()
  size_100_104: number;

  @Expose()
  size_105_109: number;

  @Expose()
  size_110_114: number;

  @Expose()
  size_115_120: number;

  @Expose()
  size_121_129: number;

  @Expose()
  min: number;

  @Expose()
  max: number;
}
