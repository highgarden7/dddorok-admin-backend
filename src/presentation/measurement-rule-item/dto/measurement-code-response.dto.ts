import { ApiProperty } from '@nestjs/swagger';
import { MeasurementCode } from 'src/domain/measurement-rule-item/enum/measurement-item-code.enum';

export class MeasurementCodeResponseDto {
  @ApiProperty({ description: '치수 규칙 항목 ID' })
  id: string;

  @ApiProperty({ description: '카테고리 (예: 상의)' })
  category: string;

  @ApiProperty({ description: '부위 (예: 몸통, 소매)' })
  section: string;

  @ApiProperty({ description: '국문 항목명 (예: 목너비)' })
  label: string;

  @ApiProperty({ description: '코드값 (예: neck_width)' })
  code: MeasurementCode;
}
