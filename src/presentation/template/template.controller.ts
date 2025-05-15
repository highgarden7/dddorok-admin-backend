import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TemplateService } from '../../application/template/template.service';
import { Authenticated } from 'src/common/decorator/authenticated';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTemplateDto } from './dto/create-template.dto';
import { plainToInstance } from 'class-transformer';
import {
  TemplateDetailResponseDto,
  TemplateListResponseDto,
  TemplateMeasurementValueResponseDto,
  TemplateResponseDto,
} from './dto/template-response.dto';
import { UpdateTemplateMeasurementValueDto } from './dto/update-template-measurement-value.dto';
import { SkipCommonResponse } from 'src/common/decorator/skip-common-response.decorator';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Authenticated()
@ApiTags('관리자 - 템플릿')
@Controller('template')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  /**
   * 템플릿 생성
   */
  @Post()
  @ApiOperation({
    summary: '템플릿 생성',
    description: `치수 규칙과 기본 정보를 기반으로 템플릿을 생성합니다. 템플릿에 필요한 측정값은 빈 값으로 자동 생성되며, 이후 수정 가능합니다.`,
  })
  @ApiResponse({
    status: 200,
    description: '템플릿 생성 성공',
    schema: {
      example: {
        code: 200,
        message: 'ok',
        data: {
          id: 'b1a2fabe-c7f2-4c92-9d49-6c849cfa65cb',
          name: '바텀업 브이넥 셋인형 스웨터',
          needle_type: 'BIG_NEEDLE',
          pattern_type: 'NARRATIVE',
          is_published: false,
          measurement_rule_id: '95e90edc-9f57-4786-b183-9243d35b9d08',
          construction_methods: ['BOTTOM_UP', 'PIECED'],
          created_date: '2025-04-24T09:00:00.000Z',
          chart_types: [
            {
              id: '0ab14f11-cc4a-4a2e-9b88-1905e0de334a',
              name: '앞몸판',
              order: 1,
            },
          ],
        },
      },
    },
  })
  async create(@Body() dto: CreateTemplateDto) {
    const result = await this.templateService.createTemplate(dto);

    return plainToInstance(TemplateResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Get('list')
  @ApiOperation({ summary: '템플릿 리스트 조회' })
  @ApiResponse({
    status: 200,
    description: '템플릿 리스트 성공',
    schema: {
      example: {
        code: 200,
        message: 'ok',
        data: [
          {
            id: '91c37f8c-ce95-4099-a62e-441b7fde4243',
            name: '테스트 2',
            needle_type: 'BIG_NEEDLE',
            pattern_type: 'NARRATIVE',
            construction_methods: ['TOP_DOWN'],
            is_published: false,
            measurement_rule_id: '7589e201-065c-440b-9bdb-63346329168d',
            chart_types: [
              {
                id: '0ab14f11-cc4a-4a2e-9b88-1905e0de334a',
                name: '앞몸판',
                order: 1,
              },
            ],
          },
        ],
      },
    },
  })
  async getAllTemplates(): Promise<TemplateListResponseDto[]> {
    const templates = await this.templateService.getAllList();
    return plainToInstance(TemplateListResponseDto, templates, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: '템플릿 단일 조회' })
  @ApiResponse({
    status: 200,
    description: '템플릿 단일 조회 성공',
    schema: {
      example: {
        code: 200,
        message: 'ok',
        data: {
          id: '91c37f8c-ce95-4099-a62e-441b7fde4243',
          name: '테스트 2',
          needle_type: 'BIG_NEEDLE',
          pattern_type: 'NARRATIVE',
          is_published: false,
          construction_methods: ['TOP_DOWN'],
          measurement_rule: {
            id: '7589e201-065c-440b-9bdb-63346329168d',
            category_large: '의류',
            category_medium: '상의',
            category_small: '스웨터',
            sleeve_type: '레글런형',
            neck_line_type: '라운드넥',
            rule_name: '라운드넥 레글런형 스웨터',
            created_date: '2025-04-21T22:21:48.106Z',
            updated_date: '2025-04-21T22:21:48.106Z',
            items: [
              {
                id: 'c74c76b8-c8ab-4f31-81cf-692e2efa7d47',
                category: '상의',
                section: '몸통',
                label: '어깨 너비',
              },
              {
                id: 'ee646bc8-3e6b-40d6-8b51-13ae66ea3890',
                category: '상의',
                section: '몸통',
                label: '목 너비',
              },
            ],
          },
          chart_types: [
            {
              id: '0ab14f11-cc4a-4a2e-9b88-1905e0de334a',
              name: '앞몸판',
              order: 1,
            },
          ],
        },
      },
    },
  })
  async getTemplate(
    @Param('id') id: string,
  ): Promise<TemplateDetailResponseDto> {
    const template = await this.templateService.getById(id);
    return plainToInstance(
      TemplateDetailResponseDto,
      {
        ...template,
        chartTypes: (template as any).chartTypes ?? [],
      },
      { excludeExtraneousValues: true },
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: '템플릿 수정' })
  @ApiParam({ name: 'id', description: '템플릿 ID(UUID)' })
  @ApiResponse({
    status: 200,
    description: '템플릿 수정 성공',
    schema: {
      example: {
        code: 200,
        message: 'ok',
        data: {
          id: '47b451c2-eed7-40ed-8b3d-cc711f80d19e',
          name: '업데이트된 템플릿 이름',
          needle_type: 'BIG_NEEDLE',
          pattern_type: 'CHART',
          is_published: false,
          measurement_rule_id: '7589e201-065c-440b-9bdb-63346329168d',
          construction_methods: ['BOTTOM_UP', 'PIECED'],
          updated_date: '2025-04-26T09:50:22.547Z',
          chart_types: [
            {
              id: '0ab14f11-cc4a-4a2e-9b88-1905e0de334a',
              name: '앞몸판',
              order: 1,
            },
          ],
        },
      },
    },
  })
  async updateTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
  ): Promise<TemplateResponseDto> {
    const result = await this.templateService.updateTemplate(id, dto);
    return plainToInstance(TemplateResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @SkipCommonResponse()
  @ApiOperation({ summary: '템플릿 삭제' })
  @ApiParam({ name: 'id', description: '템플릿 ID(UUID)' })
  @ApiResponse({
    status: 200,
    description: '템플릿 삭제 성공',
    schema: {
      example: {
        code: 200,
        message: 'ok',
      },
    },
  })
  async deleteTemplate(
    @Param('id') id: string,
  ): Promise<{ code: number; message: string }> {
    await this.templateService.deleteTemplate(id);
    return { code: 200, message: 'ok' };
  }

  @Patch(':template_id/publish')
  @ApiOperation({ summary: '템플릿 게시/취소' })
  @ApiParam({
    name: 'template_id',
    description: '템플릿 ID(UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: '템플릿 게시/취소 성공',
    schema: {
      example: {
        code: 200,
        message: 'ok',
        data: {
          id: 'c7b3d7f0-8d6a-4c5d-98e6-678e9a34b7e9',
          is_published: true,
        },
      },
    },
  })
  async publishTemplate(
    @Param('template_id') templateId: string,
    @Query('is_published', ParseBoolPipe) isPublished: boolean,
  ): Promise<{ id: string; is_publish: boolean }> {
    return await this.templateService.updateTemplatePublishStatus(
      templateId,
      isPublished,
    );
  }

  // 템플릿 세부 치수값 관련 API
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  @Get(':template_id/measurement-value')
  @ApiOperation({ summary: '템플릿 세부 치수값 조회' })
  @ApiParam({ name: 'template_id', description: '템플릿 ID(UUID)' })
  @ApiResponse({
    status: 200,
    description: '세부 치수값 조회 성공',
    schema: {
      example: {
        code: 200,
        message: 'ok',
        data: [
          {
            id: 'c7b3d7f0-8d6a-4c5d-98e6-678e9a34b7e9',
            template_id: '3f7d64c1-5f89-4935-b9d1-70a2ab44c8fc',
            measurement_item_id: '3d6f53fb-5b9e-4b64-bd1b-6b8b2c1c738d',
            code: 'chest_width',
            label: '가슴너비',
            size_50_53: null,
            size_54_57: null,
            size_58_61: null,
            size_62_65: null,
            size_66_69: null,
            size_70_73: null,
            size_74_79: null,
            size_80_84: null,
            size_85_89: null,
            size_90_94: null,
            size_95_99: null,
            size_100_104: null,
            size_105_109: null,
            size_110_114: null,
            size_115_120: null,
            size_121_129: null,
            min: null,
            max: null,
          },
        ],
      },
    },
  })
  async getMeasurementValues(
    @Param('template_id') templateId: string,
  ): Promise<TemplateMeasurementValueResponseDto[]> {
    const result =
      await this.templateService.getMeasurementValuesByTemplateId(templateId);
    return plainToInstance(TemplateMeasurementValueResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':template_id/measurement-value')
  @SkipCommonResponse()
  @ApiOperation({ summary: '템플릿 세부 치수값 수정' })
  @ApiParam({ name: 'template_id', description: '템플릿 ID(UUID)' })
  @ApiBody({
    description: '업데이트할 세부 치수값 리스트',
    type: UpdateTemplateMeasurementValueDto,
    isArray: true,
    examples: {
      example1: {
        summary: '수정 예시',
        value: [
          {
            id: 'e60d3de2-8cfa-4879-9e8d-2e1c6f03c93d',
            size_50_53: 10,
            size_54_57: 11,
            size_58_61: 12,
            size_62_65: 13,
            size_66_69: 14,
            size_70_73: 15,
            size_74_79: 16,
            size_80_84: 17,
            size_85_89: 18,
            size_90_94: 19,
            size_95_99: 20,
            size_100_104: 21,
            size_105_109: 22,
            size_110_114: 23,
            size_115_120: 24,
            size_121_129: 25,
            min: 5,
            max: 10,
            range_toggle: true,
          },
          {
            id: 'de487620-7b9b-4871-81cc-ef03b8089cad',
            size_50_53: 10,
            size_54_57: 11,
            size_58_61: 12,
            size_62_65: 13,
            size_66_69: 14,
            size_70_73: 15,
            size_74_79: 16,
            size_80_84: 17,
            size_85_89: 18,
            size_90_94: 19,
            size_95_99: 20,
            size_100_104: 21,
            size_105_109: 22,
            size_110_114: 23,
            size_115_120: 24,
            size_121_129: 25,
            min: 5,
            max: 10,
            range_toggle: false,
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '세부 치수값 수정 성공',
    schema: {
      example: {
        code: 200,
        message: 'ok',
      },
    },
  })
  async updateMeasurementValues(
    @Param('template_id') templateId: string,
    @Body() body: UpdateTemplateMeasurementValueDto[],
  ): Promise<{ code: number; message: string }> {
    return await this.templateService.updateMeasurementValues(templateId, body);
  }
}
