import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';
import { ChartPartDetail } from 'src/domain/chart-type/enum/chart-part-detail.enum';
import { ChartSection } from 'src/domain/chart-type/enum/chart-section.enum';

export class CreateChartTypeDto {
  @ApiProperty({
    name: 'category_large',
    description: '카테고리 대분류 (예: 의류)',
  })
  @IsString()
  @Expose()
  categoryLarge: string;

  @ApiProperty({
    name: 'category_medium',
    description: '카테고리 중분류 (예: 상의)',
  })
  @IsString()
  @Expose()
  categoryMedium: string;

  @ApiProperty({
    name: 'section',
    description: '구성 부위 (예: 몸판, 소매)',
    enum: ChartSection,
  })
  @IsString()
  @Expose()
  section: ChartSection;

  @ApiProperty({
    name: 'detail_type',
    description: '세부 부위명 (예: 앞몸판, 뒷몸판)',
    enum: ChartPartDetail,
  })
  @IsString()
  @Expose()
  detailType: ChartPartDetail;

  @ApiProperty({ description: '차트 이름' })
  @IsString()
  @Expose()
  name: string;

  @ApiPropertyOptional({
    name: 'measurement_rule_id',
    description: '치수 규칙 ID',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  @Expose()
  measurementRuleId?: string;

  @ApiProperty({
    name: 'measurement_code_maps',
    description: '측정 항목 코드 및 매핑 pathId 정보 리스트',
    example: [
      {
        measurement_code: 'shoulder_width',
        path_id: 'BODY_FRONT_SHOULDER_WIDTH',
      },
      {
        measurement_code: 'shoulder_length',
        path_id: 'BODY_FRONT_SHOULDER_LENGTH',
      },
    ],
    type: [Object],
  })
  @IsArray()
  @Expose()
  measurementCodeMaps: {
    measurementCode: string;
    pathId: string;
  }[];

  @ApiProperty({
    name: 'resource_id',
    description: 'svg 파일 ID',
    format: 'uuid',
  })
  @IsUUID()
  @Expose()
  resourceId: string;
}
