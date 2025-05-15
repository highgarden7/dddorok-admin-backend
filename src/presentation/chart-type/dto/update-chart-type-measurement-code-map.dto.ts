import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { Expose } from 'class-transformer';

export class UpdateChartTypeMeasurementCodeMapDto {
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
}
