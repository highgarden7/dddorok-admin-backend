// src/presentation/template/dto/update-template-measurement-value.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class UpdateTemplateMeasurementValueDto {
  @ApiProperty({ description: '측정 항목 ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: '사이즈별 값: 50-53' })
  @IsNumber()
  @IsOptional()
  size_50_53: number;

  @ApiProperty({ description: '사이즈별 값: 54-57' })
  @IsNumber()
  size_54_57: number;

  @ApiProperty({ description: '사이즈별 값: 58-61' })
  @IsNumber()
  size_58_61: number;

  @ApiProperty({ description: '사이즈별 값: 62-65' })
  @IsNumber()
  size_62_65: number;

  @ApiProperty({ description: '사이즈별 값: 66-69' })
  @IsNumber()
  @IsOptional()
  size_66_69: number;

  @ApiProperty({ description: '사이즈별 값: 70-73' })
  @IsNumber()
  @IsOptional()
  size_70_73: number;

  @ApiProperty({ description: '사이즈별 값: 74-79' })
  @IsNumber()
  @IsOptional()
  size_74_79: number;

  @ApiProperty({ description: '사이즈별 값: 80-84' })
  @IsNumber()
  @IsOptional()
  size_80_84: number;

  @ApiProperty({ description: '사이즈별 값: 85-89' })
  @IsNumber()
  @IsOptional()
  size_85_89: number;

  @ApiProperty({ description: '사이즈별 값: 90-94' })
  @IsNumber()
  @IsOptional()
  size_90_94: number;

  @ApiProperty({ description: '사이즈별 값: 95-99' })
  @IsNumber()
  @IsOptional()
  size_95_99: number;

  @ApiProperty({ description: '사이즈별 값: 100-104' })
  @IsNumber()
  @IsOptional()
  size_100_104: number;

  @ApiProperty({ description: '사이즈별 값: 105-109' })
  @IsNumber()
  @IsOptional()
  size_105_109: number;

  @ApiProperty({ description: '사이즈별 값: 110-114' })
  @IsNumber()
  @IsOptional()
  size_110_114: number;

  @ApiProperty({ description: '사이즈별 값: 115-120' })
  @IsNumber()
  @IsOptional()
  size_115_120: number;

  @ApiProperty({ description: '사이즈별 값: 121-129' })
  @IsNumber()
  @IsOptional()
  size_121_129: number;

  @ApiProperty({ description: '최소 min' })
  @IsNumber()
  @IsOptional()
  min: number;

  @ApiProperty({ description: '최대 max' })
  @IsNumber()
  @IsOptional()
  max: number;

  @ApiProperty({
    name: 'range_toggle',
    description: 'range 토글 on/off',
  })
  @IsBoolean()
  rangeToggle: boolean;
}
