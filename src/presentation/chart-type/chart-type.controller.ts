import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ChartTypeService } from '../../application/chart-type/chart-type.service';
import { Authenticated } from 'src/common/decorator/authenticated';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateChartTypeDto } from './dto/create-chart-type.dto';
import { plainToInstance } from 'class-transformer';
import {
  ChartTypeDetailResponseDto,
  ChartTypeResponseDto,
} from './dto/chart-type-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateChartTypeMeasurementCodeMapDto } from './dto/update-chart-type-measurement-code-map.dto';
import { SkipCommonResponse } from 'src/common/decorator/skip-common-response.decorator';

@Authenticated()
@ApiTags('관리자 - 차트')
@Controller('chart-type')
export class ChartTypeController {
  constructor(private readonly chartTypeService: ChartTypeService) {}

  /**
   * 차트 유형 생성 요청
   * 이름, 카테고리, 구성 부위(section), 세부 부위(detail_type), 치수 항목 정보를 입력받아 차트 유형을 생성합니다.
   */
  @Post()
  @ApiOperation({
    summary: '차트 유형 생성',
    description: `차트 이름, 카테고리, 부위 정보를 입력하고, 측정 항목 코드와 SVG path 매핑 정보를 함께 전달하여 차트 유형을 생성합니다. ***measurement_rule_id***는 ***Optional***값입니다.`,
  })
  @ApiResponse({
    status: 200,
    description: '차트 유형 생성 성공',
    schema: {
      example: {
        code: 200,
        message: 'ok',
        data: {
          id: 'c1e6d453-18dc-4e70-9f0c-2bb1a24890a3',
          name: '앞몸판',
          category_large: '의류',
          category_medium: '상의',
          section: 'BODY',
          detail_type: 'FRONT_BODY',
          created_date: '2024-05-07T12:34:56.789Z',
          updated_date: '2024-05-07T12:34:56.789Z',
          measurement_code_maps: [
            {
              measurement_code: 'chest_width',
              path_id: 'BODY_FRONT_CHEST_WIDTH',
            },
            {
              measurement_code: 'shoulder_width',
              path_id: 'BODY_FRONT_SHOULDER_WIDTH',
            },
          ],
          resource_id: 'a0e3c9c2-1b2a-4c9a-88d9-67f2032f193a',
        },
      },
    },
  })
  async createChartType(@Body() dto: CreateChartTypeDto) {
    const chartType = await this.chartTypeService.create(dto);
    return plainToInstance(ChartTypeResponseDto, chartType, {
      excludeExtraneousValues: true,
    });
  }

  @Get('/list')
  @ApiOperation({ summary: '차트 유형 리스트 조회' })
  @ApiResponse({
    status: 200,
    description: '차트 유형 리스트 반환 성공',
    schema: {
      example: {
        code: 200,
        message: 'ok',
        data: [
          {
            id: '3905c16c-b2a3-4f6d-9b4e-3380be22ea8d',
            name: '라운드넥 래글런형 상의 앞몸판',
            category_large: '의류',
            category_medium: '상의',
            section: 'BODY',
            detail_type: 'FRONT_BODY',
            created_date: '2025-05-11 20:54:58',
            updated_date: '2025-05-11 20:54:58',
            svg_file_id: '1fbc54e1-6014-4993-9757-4aa6cad54d7a',
            template_count: 3,
          },
        ],
      },
    },
  })
  async getList(): Promise<ChartTypeResponseDto[]> {
    return this.chartTypeService.getChartTypeList();
  }

  @Get(':id')
  @ApiOperation({
    summary: '차트 유형 단일 조회',
    description: `차트 유형 ID를 기준으로 차트 상세 정보를 조회합니다.

⚠️ 주의: 연결된 측정 항목 매핑 정보(measurementMaps)도 함께 반환됩니다.`,
  })
  @ApiParam({
    name: 'id',
    description: '차트 유형 ID (UUID 형식)',
    type: String,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: '차트 유형 조회 성공',
    schema: {
      example: {
        code: 200,
        message: 'ok',
        data: {
          id: 'c1e6d453-18dc-4e70-9f0c-2bb1a24890a3',
          name: '앞몸판',
          category_large: '의류',
          category_medium: '상의',
          section: 'BODY',
          detail_type: 'FRONT_BODY',
          created_date: '2024-05-07T12:34:56.789Z',
          updated_date: '2024-05-07T12:34:56.789Z',
          measurement_maps: [
            {
              measurement_code: 'chest_width',
              path_id: 'BODY_FRONT_CHEST_WIDTH',
            },
            {
              measurement_code: 'shoulder_width',
              path_id: 'BODY_FRONT_CHEST_WIDTH',
            },
          ],
          templates: [
            {
              id: '406677bc-254b-4230-a0ba-a959b4a9431a',
              name: '라운드넥 래글런형 가디건',
            },
            {
              id: 'f97bfe3e-31c4-4f39-8e7a-eacc548945ac',
              name: '라운드넥 래글런형 베스트',
            },
          ],
        },
      },
    },
  })
  async getOne(@Param('id') id: string): Promise<ChartTypeDetailResponseDto> {
    return await this.chartTypeService.getChartTypeById(id);
  }

  @Patch(':id/measurement-code-maps')
  @ApiOperation({
    summary: '차트 유형 측정항목 매핑 수정',
    description: `기존 매핑을 전부 삭제한 후 전달받은 측정항목 코드/Path 매핑으로 교체합니다.`,
  })
  @ApiParam({ name: 'id', description: '차트 유형 ID(UUID)' })
  @ApiResponse({
    status: 200,
    description: '차트 유형 매핑 수정 성공',
    schema: {
      example: {
        code: 200,
        message: 'ok',
        data: {
          id: 'c1e6d453-18dc-4e70-9f0c-2bb1a24890a3',
          name: '앞몸판',
          category_large: '의류',
          category_medium: '상의',
          section: 'BODY',
          detail_type: 'FRONT_BODY',
          created_date: '2024-05-07T12:34:56.789Z',
          updated_date: '2024-05-07T12:34:56.789Z',
          measurement_code_maps: [
            {
              measurement_code: 'chest_width',
              path_id: 'BODY_FRONT_CHEST_WIDTH',
            },
            {
              measurement_code: 'shoulder_width',
              path_id: 'BODY_FRONT_SHOULDER_WIDTH',
            },
          ],
          svg_file_id: 'a0e3c9c2-1b2a-4c9a-88d9-67f2032f193a',
        },
      },
    },
  })
  async updateMeasurementCodeMaps(
    @Param('id') id: string,
    @Body() dto: UpdateChartTypeMeasurementCodeMapDto,
  ) {
    const result = await this.chartTypeService.updateMeasurementCodeMaps(
      id,
      dto,
    );

    return plainToInstance(ChartTypeResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @SkipCommonResponse()
  @ApiOperation({
    summary: '차트 유형 삭제',
    description:
      '차트 유형을 삭제합니다. 사용 중인 템플릿이 존재할 경우 삭제되지 않습니다.',
  })
  @ApiParam({ name: 'id', description: '차트 유형 ID(UUID)' })
  @ApiResponse({
    status: 200,
    description: '차트 유형 삭제 성공',
    schema: { example: { code: 200, message: 'ok' } },
  })
  async deleteChartType(@Param('id') id: string) {
    await this.chartTypeService.deleteChartType(id);
    return { code: 200, message: 'ok' };
  }

  @Post('/upload-svg')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'SVG 파일 업로드 및 리소스 등록',
    description: `차트 유형과 연결할 SVG 파일을 업로드합니다.`,
  })
  @ApiBody({
    description: 'SVG 파일 (Content-Type: multipart/form-data)',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'SVG 형식의 파일 (예: chart.svg)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '업로드 성공 및 resourceId 반환',
    schema: {
      example: {
        code: 200,
        message: 'ok',
        data: {
          resource_id: 'a0e3c9c2-1b2a-4c9a-88d9-67f2032f193a',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '파일이 존재하지 않거나 유효하지 않은 경우',
  })
  @ApiResponse({
    status: 500,
    description: 'S3 업로드 또는 DB 등록 실패 시',
  })
  async uploadSvg(@UploadedFile() file: Express.Multer.File) {
    const resourceId =
      await this.chartTypeService.uploadSvgAndCreateResource(file);
    return { resourceId };
  }
}
