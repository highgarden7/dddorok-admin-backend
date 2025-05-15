import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type, Transform } from 'class-transformer';

export class MeasurementRuleItemResponseDto {
  @Expose()
  id: string;

  @Expose()
  category: string;

  @Expose()
  section: string;

  @Expose()
  label: string;

  @Expose()
  code: string;
}

export class MeasurementRuleResponseDto {
  @Expose()
  id: string;

  @Expose()
  categoryLarge: string;

  @Expose()
  categoryMedium: string;

  @Expose()
  categorySmall: string;

  @Expose()
  sleeveType?: string;

  @Expose()
  neckLineType?: string;

  @Expose()
  ruleName: string;

  @Expose()
  @Transform(({ value }) => value?.toISOString(), { toPlainOnly: true })
  createdDate: Date;

  @Expose()
  @Transform(({ value }) => value?.toISOString(), { toPlainOnly: true })
  updatedDate: Date;

  @Expose()
  @Type(() => MeasurementRuleItemResponseDto)
  items: MeasurementRuleItemResponseDto[];
}

export class MeasurementRuleListResponseDto {
  @ApiProperty({ description: '규칙 ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: '규칙 이름' })
  @Expose()
  ruleName: string;

  @ApiProperty({ description: '카테고리 (대분류)' })
  @Expose()
  categoryLarge: string;

  @ApiProperty({ description: '카테고리 (중분류)' })
  @Expose()
  categoryMedium: string;

  @ApiProperty({ description: '카테고리 (소분류)' })
  @Expose()
  categorySmall: string;

  @ApiProperty({ description: '소매 유형' })
  @Expose()
  sleeveType?: string;

  @ApiProperty({ description: '넥라인 유형' })
  @Expose()
  neckLineType?: string;

  @ApiProperty({ description: '치수 항목 수' })
  @Expose()
  measurementItemCount: number;

  @ApiProperty({ description: '템플릿 수' })
  @Expose()
  templateCount: number;
}
