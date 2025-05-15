import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsUUID, IsOptional, IsArray } from 'class-validator';
import { NeedleType } from 'src/domain/template/enum/needle-type.enum';
import { ChartType } from 'src/domain/template/enum/chart-type.enum';
import { ConstructionMethod } from 'src/domain/template/enum/construction-method.enum';

export class UpdateTemplateDto {
  @ApiProperty({ name: 'name', description: '템플릿 이름' })
  @IsString()
  name: string;

  @ApiProperty({
    name: 'needle_type',
    description: '도구 유형',
    enum: NeedleType,
  })
  @IsEnum(NeedleType)
  needleType: NeedleType;

  @ApiProperty({
    name: 'chart_type',
    description: '도안 유형',
    enum: ChartType,
  })
  @IsEnum(ChartType)
  chartType: ChartType;

  @ApiProperty({
    name: 'construction_methods',
    description: '제작 방식',
    enum: ConstructionMethod,
    isArray: true,
  })
  @IsArray()
  @IsEnum(ConstructionMethod, { each: true })
  constructionMethods: ConstructionMethod[];

  @ApiPropertyOptional({
    name: 'chart_type_maps',
    description: '차트 유형 ID 및 순서 리스트',
    example: [
      { chart_type_id: '0ab14f11-cc4a-4a2e-9b88-1905e0de334a', order: 1 },
      { chart_type_id: 'bf17832e-e7f2-42d7-abc2-880e9dc89d21', order: 2 },
    ],
    type: [Object],
  })
  @IsOptional()
  @IsArray()
  chartTypeMaps?: { chartTypeId: string; order: number }[];
}
