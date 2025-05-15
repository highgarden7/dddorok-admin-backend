import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray } from 'class-validator';
import { NeckLineType } from 'src/domain/mesurement-rule/enum/neck-line-type.enum';
import { SleeveType } from 'src/domain/mesurement-rule/enum/sleeve-type.enum';

export class CreateMeasurementRuleDto {
  @ApiProperty({
    name: 'category_large',
    description: '카테고리 대분류 (예: 의류)',
  })
  @IsString()
  categoryLarge: string;

  @ApiProperty({
    name: 'category_medium',
    description: '카테고리 중분류 (예: 상의)',
  })
  @IsString()
  categoryMedium: string;

  @ApiProperty({
    name: 'category_small',
    description: '카테고리 소분류 (예: 스웨터)',
  })
  @IsString()
  categorySmall: string;

  @ApiProperty({
    name: 'sleeve_type',
    description: '소매 유형 (선택값, 예: 레글런형)',
    enum: SleeveType,
  })
  @IsString()
  sleeveType: SleeveType;

  @ApiProperty({
    name: 'neck_line_type',
    description: '넥라인 유형 (선택값, 예: 라운드넥)',
    enum: NeckLineType,
  })
  @IsString()
  neckLineType: NeckLineType;

  @ApiProperty({ name: 'rule_name', description: '규칙 이름 (유니크 값)' })
  @IsString()
  ruleName: string;

  @ApiProperty({
    name: 'measurement_codes',
    description: '치수 항목 코드 리스트 (예: ["chest_width", "sleeve_length"])',
    type: [String],
  })
  @IsArray()
  measurementCodes: string[];
}
