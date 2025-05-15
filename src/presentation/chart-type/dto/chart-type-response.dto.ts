import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ChartTypeMeasurementMapDto {
  @ApiProperty({
    description: '측정 항목 코드',
    example: 'chest_width',
  })
  @Expose()
  measurementCode: string;

  @ApiProperty({
    description: 'SVG path ID',
    example: 'BODY_FRONT_CHEST_WIDTH',
    nullable: true,
  })
  @Expose()
  pathId: string;
}

export class ChartTypeResponseDto {
  @ApiProperty({ description: '차트 유형 ID', format: 'uuid' })
  @Expose()
  id: string;

  @ApiProperty({ description: '차트 이름', example: '앞몸판' })
  @Expose()
  name: string;

  @ApiProperty({ description: '대분류 카테고리', example: '의류' })
  @Expose()
  categoryLarge: string;

  @ApiProperty({ description: '중분류 카테고리', example: '상의' })
  @Expose()
  categoryMedium: string;

  @ApiProperty({ description: '구성 부위', example: 'BODY' })
  @Expose()
  section: string;

  @ApiProperty({ description: '세부 부위명', example: 'FRONT_BODY' })
  @Expose()
  detailType: string;

  @ApiProperty({
    description: '생성 일자',
    example: '2024-05-07T12:34:56.789Z',
  })
  @Expose()
  createdDate: string;

  @ApiProperty({
    description: '수정 일자',
    example: '2024-05-07T12:34:56.789Z',
  })
  @Expose()
  updatedDate: string;

  @ApiProperty({
    description: '연결된 측정 항목 및 path ID 매핑 리스트',
    type: [ChartTypeMeasurementMapDto],
  })
  @Expose()
  @Type(() => ChartTypeMeasurementMapDto)
  measurementCodeMaps: ChartTypeMeasurementMapDto[];

  @ApiProperty({
    name: 'resource_id',
    description: 'svg 파일 ID',
    format: 'uuid',
  })
  @Expose()
  svgFileId: string;

  @ApiProperty({
    name: 'template_count',
    description: '연결된 템플릿 수',
    example: 3,
  })
  @Expose()
  templateCount: number;
}

export class ChartTypeDetailResponseDto {
  @ApiProperty({ description: '차트 유형 ID', format: 'uuid' })
  @Expose()
  id: string;

  @ApiProperty({ description: '차트 이름', example: '앞몸판' })
  @Expose()
  name: string;

  @ApiProperty({ description: '대분류 카테고리', example: '의류' })
  @Expose()
  categoryLarge: string;

  @ApiProperty({ description: '중분류 카테고리', example: '상의' })
  @Expose()
  categoryMedium: string;

  @ApiProperty({ description: '구성 부위', example: 'BODY' })
  @Expose()
  section: string;

  @ApiProperty({ description: '세부 부위명', example: 'FRONT_BODY' })
  @Expose()
  detailType: string;

  @ApiProperty({
    description: '생성 일자',
    example: '2024-05-07T12:34:56.789Z',
  })
  @Expose()
  createdDate: string;

  @ApiProperty({
    description: '수정 일자',
    example: '2024-05-07T12:34:56.789Z',
  })
  @Expose()
  updatedDate: string;

  @ApiProperty({
    description: '연결된 측정 항목 및 path ID 매핑 리스트',
    type: [ChartTypeMeasurementMapDto],
  })
  @Expose()
  @Type(() => ChartTypeMeasurementMapDto)
  measurementCodeMaps: ChartTypeMeasurementMapDto[];

  @ApiProperty({
    description: 'SVG 파일 url',
    format: 'string',
  })
  @Expose()
  svgFileUrl: string;

  @ApiProperty({
    description: '연결된 템플릿 리스트',
    name: 'templates',
    example: [
      {
        id: 'e8bd8a4d-d5ee-4b98-a580-172751cbaf1c',
        name: '라운드넥 래글런형 스웨터',
      },
      {
        id: '406677bc-254b-4230-a0ba-a959b4a9431a',
        name: '라운드넥 래글런형 가디건',
      },
    ],
  })
  @Expose()
  templates: { id: string; name: string }[];
}
