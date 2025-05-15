import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { MeasurementRuleService } from 'src/application/measurement-rule/measurement-rule.service';
import { Authenticated } from 'src/common/decorator/authenticated';
import { CreateMeasurementRuleDto } from 'src/presentation/measurement-rule/dto/create-measurement-rule.dto';
import { MeasurementRuleResponseDto } from './dto/measurement-rule-response.dto';
import { UpdateMeasurementRuleDto } from './dto/update-measurement-rule.dto';
import { SkipCommonResponse } from 'src/common/decorator/skip-common-response.decorator';
import { TemplateDetailResponseDto } from '../template/dto/template-response.dto';
import { TemplateService } from 'src/application/template/template.service';

@Authenticated()
@ApiTags('관리자 - 치수 규칙')
@Controller('measurement-rule')
export class MeasurementRuleController {
  constructor(
    private readonly ruleService: MeasurementRuleService,
    private readonly templateService: TemplateService,
  ) {}
  /**
   * 치수 규칙 생성 요청
   * 규칙명, 카테고리, 조건값(소매/넥라인)과 선택된 측정 항목의 `code` 값을 입력 받아
   * 치수 규칙과 항목을 함께 생성합니다.
   */
  @Post()
  @ApiOperation({
    summary: '치수 규칙 및 항목 생성',
    description: `규칙 이름과 카테고리 정보를 입력하고, 선택된 측정 항목 code 리스트를 함께 전달하여 치수 규칙을 생성합니다.`,
  })
  @ApiResponse({
    status: 200,
    description: '치수 규칙 생성 성공',
    schema: {
      example: {
        code: 200,
        message: 'ok',
        data: {
          id: '87ad16e1-1eab-4f8a-9a7b-76c5a6fc65ea',
          category_large: '의류',
          category_medium: '상의',
          category_small: '스웨터',
          sleeve_type: '레글런형',
          neck_line_type: '라운드넥',
          rule_name: '라운드넥 레글런형 스웨터',
          created_date: '2024-04-14T12:32:15.123Z',
          updated_date: '2024-04-14T12:32:15.123Z',
          items: [
            {
              id: 'ba5fc16b-96b4-4c2c-bbfd-98d2c8a46ddf',
              category: '상의',
              section: '몸통',
              label: '가슴너비',
              code: 'chest_width',
            },
            {
              id: '89ecbf09-8a8c-4c17-8772-2e909dd4179c',
              category: '상의',
              section: '소매',
              label: '소매길이',
              code: 'sleeve_length',
            },
          ],
        },
      },
    },
  })
  async create(@Body() dto: CreateMeasurementRuleDto) {
    const rule = await this.ruleService.createRule(dto);

    return plainToInstance(MeasurementRuleResponseDto, rule, {
      excludeExtraneousValues: true,
    });
  }

  @Get('list')
  @ApiOperation({
    summary: '치수 규칙 목록 조회',
    description: '모든 치수 규칙을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    schema: {
      example: {
        code: 200,
        message: 'ok',
        data: [
          {
            id: '547f37d9-5650-426f-89cb-79dd28705088',
            rule_name: '상의 스웨터 라운드넥',
            category_large: '의류',
            category_medium: '상의',
            category_small: '스웨터',
            sleeve_type: '레글런',
            neck_line_type: '라운드넥',
            measurement_item_count: 2,
            template_count: 0,
          },
        ],
      },
    },
  })
  async getRullList() {
    return await this.ruleService.getRullList();
  }

  @Get(':id')
  @ApiOperation({
    summary: '치수 규칙 단일 조회',
    description: 'ID를 기반으로 하나의 치수 규칙 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    schema: {
      example: {
        id: '87ad16e1-1eab-4f8a-9a7b-76c5a6fc65ea',
        category_large: '의류',
        category_medium: '상의',
        category_small: '스웨터',
        sleeve_Type: '레글런',
        neck_line_type: '터틀넥',
        rule_name: '상의 스웨터 레글런 터틀넥',
        created_date: '2024-04-14T12:32:15.123Z',
        updated_date: '2024-04-14T12:32:15.123Z',
        items: [
          {
            id: 'ba5fc16b-96b4-4c2c-bbfd-98d2c8a46ddf',
            ruleId: '87ad16e1-1eab-4f8a-9a7b-76c5a6fc65ea',
            category: '상의',
            section: '몸통',
            label: '가슴너비',
            code: 'chest_width',
          },
        ],
      },
    },
  })
  @ApiParam({ name: 'id', description: '치수 규칙 ID' })
  async getOne(@Param('id') id: string) {
    const rule = await this.ruleService.getRuleById(id);
    return plainToInstance(MeasurementRuleResponseDto, rule, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @ApiOperation({
    summary: '치수 규칙 수정',
    description:
      '기존 규칙을 수정합니다. 연결된 템플릿이 있는 경우 수정할 수 없습니다.',
  })
  @ApiParam({ name: 'id', description: '치수 규칙 ID' })
  async update(@Param('id') id: string, @Body() dto: UpdateMeasurementRuleDto) {
    const rule = await this.ruleService.updateRule(id, dto);
    return plainToInstance(MeasurementRuleResponseDto, rule, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiOperation({
    summary: '치수 규칙 삭제',
    description:
      'ID로 치수 규칙을 삭제합니다. 연결된 템플릿이 있는 경우 삭제할 수 없습니다.',
  })
  @ApiParam({ name: 'id', description: '치수 규칙 ID' })
  @ApiResponse({ status: 200, description: '삭제 성공' })
  @SkipCommonResponse()
  async deleteRule(@Param('id') id: string) {
    return this.ruleService.deleteRule(id);
  }

  // 템플릿 관련 API
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  @Get(':id/template/list')
  @ApiOperation({ summary: '치수규칙 id로 템플릿 리스트 조회' })
  async getTemplateListByMeasurementRuleId(
    @Param('id') id: string,
  ): Promise<TemplateDetailResponseDto[]> {
    const template =
      await this.templateService.getTemplateListByMeasurementRuleId(id);
    return plainToInstance(TemplateDetailResponseDto, template, {
      excludeExtraneousValues: true,
    });
  }
}
