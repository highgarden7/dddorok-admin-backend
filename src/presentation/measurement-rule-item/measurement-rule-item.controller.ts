import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MeasurementRuleItemService } from 'src/application/measurement-rule-item/measurement-rule-item.service';
import { Authenticated } from 'src/common/decorator/authenticated';
import { MeasurementCodeResponseDto } from './dto/measurement-code-response.dto';

@Authenticated()
@ApiTags('관리자 - 치수 규칙 항목')
@Controller('measurement-rule-item')
export class MeasurementRuleItemController {
  constructor(
    private readonly measurementRuleItemService: MeasurementRuleItemService,
  ) {}

  @Get('code')
  @ApiOperation({ summary: '사용 가능한 치수 코드 목록 조회' })
  @ApiQuery({
    name: 'category',
    required: false,
    description: '옵션: 카테고리 필터 (예: 상의)',
  })
  @ApiResponse({
    status: 200,
    description: '사용 가능한 치수 코드 목록',
    type: MeasurementCodeResponseDto,
    schema: {
      example: {
        code: 200,
        message: 'ok',
        data: [
          {
            id: 'ba5fc16b-96b4-4c2c-bbfd-98d2c8a46ddf',
            category: '상의',
            section: '몸통',
            label: '가슴너비',
          },
          {
            id: '89ecbf09-8a8c-4c17-8772-2e909dd4179c',
            category: '상의',
            section: '소매',
            label: '소매길이',
          },
        ],
      },
    },
  })
  async getAvailableMeasurementCodes(
    @Query('category') category?: string,
  ): Promise<MeasurementCodeResponseDto[]> {
    const result =
      await this.measurementRuleItemService.findAvailableCodes(category);
    return result;
  }
}
