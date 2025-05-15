import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Template } from 'src/domain/template/template.entity';
import { MeasurementRule } from 'src/domain/mesurement-rule/measurement-rule.entity';
import { CreateTemplateDto } from 'src/presentation/template/dto/create-template.dto';
import { CustomException } from 'src/common/exception/custom.exception';
import { ErrorCode } from 'src/common/exception/error-code.enum';
import { MeasurementRuleItem } from 'src/domain/measurement-rule-item/measurement-rule-item.entity';
import { TemplateMeasurementValue } from 'src/domain/template/template-measurement-value.entity';
import { UpdateTemplateMeasurementValueDto } from 'src/presentation/template/dto/update-template-measurement-value.dto';
import { UpdateTemplateDto } from 'src/presentation/template/dto/update-template.dto';
import { TemplateListResponseDto } from 'src/presentation/template/dto/template-response.dto';
import { TemplateChartTypeMap } from 'src/domain/template/template-chart-type-map.entity';
import { ChartType } from 'src/domain/chart-type/chart-type.entity';

@Injectable()
export class TemplateService {
  constructor(
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,

    @InjectRepository(MeasurementRule)
    private readonly measurementRuleRepository: Repository<MeasurementRule>,

    @InjectRepository(MeasurementRuleItem)
    private readonly ruleItemRepository: Repository<MeasurementRuleItem>,

    @InjectRepository(TemplateMeasurementValue)
    private readonly valueRepository: Repository<TemplateMeasurementValue>,

    @InjectRepository(TemplateChartTypeMap)
    private readonly templateChartTypeMapRepository: Repository<TemplateChartTypeMap>,

    private readonly dataSource: DataSource,
  ) {}

  async createTemplate(dto: CreateTemplateDto): Promise<Template> {
    const {
      name,
      needleType,
      chartType: patternType,
      measurementRuleId,
      constructionMethods,
      chartTypeMaps,
    } = dto;

    const rule = await this.measurementRuleRepository.findOne({
      where: { id: measurementRuleId },
    });

    if (!rule) {
      throw new CustomException(
        '연결할 치수 규칙이 존재하지 않습니다.',
        'MEASUREMENT_RULE_NOT_FOUND',
        ErrorCode.NOT_FOUND,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. 템플릿 저장
      const template = queryRunner.manager.create(Template, {
        name,
        needleType,
        patternType,
        measurementRuleId,
        measurementRule: rule,
        constructionMethods,
      });
      const savedTemplate = await queryRunner.manager.save(template);

      // 차트 유형 매핑 생성
      if (chartTypeMaps && chartTypeMaps.length > 0) {
        const chartTypeMapEntities = chartTypeMaps.map((map) =>
          queryRunner.manager.create(TemplateChartTypeMap, {
            templateId: savedTemplate.id,
            chartTypeId: map.chartTypeId,
            order: map.order,
          }),
        );
        await queryRunner.manager.save(chartTypeMapEntities);
      }

      // 2. 관련된 규칙의 측정 항목 가져오기
      const ruleItems = await queryRunner.manager.find(MeasurementRuleItem, {
        where: { rule: { id: measurementRuleId } },
      });

      // 3. 초기 상태의 빈 TemplateMeasurementValue 생성
      const values = ruleItems.map((item) =>
        queryRunner.manager.create(TemplateMeasurementValue, {
          templateId: savedTemplate.id,
          template: savedTemplate,
          label: item.label,
          code: item.code,
        }),
      );

      await queryRunner.manager.save(TemplateMeasurementValue, values);

      await queryRunner.commitTransaction();

      // 4. 연결된 차트유형 조회 포함
      const savedChartTypeMaps = await this.templateChartTypeMapRepository.find(
        {
          where: { templateId: savedTemplate.id },
          relations: ['chartType'],
        },
      );

      const chartTypes = savedChartTypeMaps.map((map) => ({
        id: map.chartType.id,
        name: map.chartType.name,
        order: map.order,
      }));

      return Object.assign(savedTemplate, { chartTypes });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getAllList(): Promise<
    (Template & { chartTypes: { id: string; name: string; order: number }[] })[]
  > {
    const templates = await this.templateRepository.find({
      order: { createdDate: 'DESC' },
    });

    const templateIds = templates.map((template) => template.id);

    if (templateIds.length === 0) return [];

    // 연결된 매핑 조회
    const newchartTypeMaps = await this.templateChartTypeMapRepository.find({
      where: { templateId: In(templateIds) },
      relations: ['chartType'],
    });

    // Template ID 기준으로 그룹핑
    const chartTypeMapByTemplateId = newchartTypeMaps.reduce(
      (acc, map) => {
        if (!acc[map.templateId]) acc[map.templateId] = [];
        acc[map.templateId].push({
          id: map.chartType.id,
          name: map.chartType.name,
          order: map.order,
        });
        return acc;
      },
      {} as Record<string, { id: string; name: string; order: number }[]>,
    );

    // Template과 연결된 chartTypes 포함해서 반환
    return templates.map((template) =>
      Object.assign(template, {
        chartTypes: chartTypeMapByTemplateId[template.id] ?? [],
      }),
    );
  }

  async getById(
    id: string,
  ): Promise<
    Template & { chartTypes: { id: string; name: string; order: number }[] }
  > {
    const found = await this.templateRepository.findOne({
      where: { id },
      relations: ['measurementRule', 'measurementRule.items'],
    });

    if (!found) {
      throw new CustomException(
        '템플릿을 찾을 수 없습니다.',
        'TEMPLATE_NOT_FOUND',
        ErrorCode.NOT_FOUND,
      );
    }

    // 🔥 TemplateChartTypeMap 기준으로 연결된 ChartType + order 가져오기
    const chartTypeMaps = await this.templateChartTypeMapRepository.find({
      where: { templateId: id },
      relations: ['chartType'],
    });

    const chartTypes = chartTypeMaps.map((map) => ({
      id: map.chartType.id,
      name: map.chartType.name,
      order: map.order,
    }));

    // 👉 추가적으로 chartTypes 필드를 포함해서 반환
    return Object.assign(found, { chartTypes });
  }

  async updateTemplate(
    id: string,
    dto: UpdateTemplateDto,
  ): Promise<
    Template & { chartTypes: { id: string; name: string; order: number }[] }
  > {
    const template = await this.templateRepository.findOne({
      where: { id },
    });

    if (!template) {
      throw new CustomException(
        '템플릿을 찾을 수 없습니다.',
        'TEMPLATE_NOT_FOUND',
        ErrorCode.NOT_FOUND,
      );
    }

    Object.assign(template, {
      name: dto.name,
      needleType: dto.needleType,
      chartType: dto.chartType,
      constructionMethods: dto.constructionMethods,
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const savedTemplate = await queryRunner.manager.save(template);

      // 기존 매핑 삭제 후 재생성
      await queryRunner.manager.delete(TemplateChartTypeMap, {
        templateId: savedTemplate.id,
      });

      if (dto.chartTypeMaps && dto.chartTypeMaps.length > 0) {
        const chartTypeMapEntities = dto.chartTypeMaps.map((map) =>
          queryRunner.manager.create(TemplateChartTypeMap, {
            templateId: savedTemplate.id,
            chartTypeId: map.chartTypeId,
            order: map.order,
          }),
        );
        await queryRunner.manager.save(chartTypeMapEntities);
      }

      await queryRunner.commitTransaction();

      // ✅ 수정 후 연결된 chartTypes 조회 (order 포함)
      const chartTypeMaps = await this.templateChartTypeMapRepository.find({
        where: { templateId: savedTemplate.id },
        relations: ['chartType'],
      });

      const chartTypes = chartTypeMaps.map((map) => ({
        id: map.chartType.id,
        name: map.chartType.name,
        order: map.order,
      }));

      return Object.assign(savedTemplate, { chartTypes });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteTemplate(id: string): Promise<void> {
    const template = await this.templateRepository.findOne({ where: { id } });

    if (!template) {
      throw new CustomException(
        '템플릿을 찾을 수 없습니다.',
        'TEMPLATE_NOT_FOUND',
        ErrorCode.NOT_FOUND,
      );
    }

    await this.templateRepository.delete(id);
  }

  async updateTemplatePublishStatus(
    templateId: string,
    isPublished: boolean,
  ): Promise<{ id: string; is_publish: boolean }> {
    const template = await this.templateRepository.findOne({
      where: { id: templateId },
    });

    if (!template) {
      throw new CustomException(
        `템플릿(${templateId})을 찾을 수 없습니다.`,
        'TEMPLATE_NOT_FOUND',
        ErrorCode.NOT_FOUND,
      );
    }

    template.isPublished = isPublished;
    const saved = await this.templateRepository.save(template);

    return {
      id: saved.id,
      is_publish: saved.isPublished,
    };
  }

  // 세부수치 관련
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  async getMeasurementValuesByTemplateId(
    templateId: string,
  ): Promise<TemplateMeasurementValue[]> {
    return this.valueRepository.find({
      where: { templateId },
    });
  }

  async updateMeasurementValues(
    templateId: string,
    dtos: UpdateTemplateMeasurementValueDto[],
  ): Promise<{ code: number; message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    console.log('updateMeasurementValues', dtos);
    try {
      for (const dto of dtos) {
        // rangeToggle이 false인 경우 min/max를 0으로 강제 변경
        const updatePayload: Partial<TemplateMeasurementValue> = {
          ...dto,
          min: dto.rangeToggle ? dto.min : 0,
          max: dto.rangeToggle ? dto.max : 0,
          rangeToggle: dto.rangeToggle,
        };

        const result = await queryRunner.manager.update(
          TemplateMeasurementValue,
          { id: dto.id, templateId },
          updatePayload,
        );

        if (result.affected === 0) {
          throw new CustomException(
            `치수 항목(${dto.id})을 찾을 수 없습니다.`,
            'TEMPLATE_MEASUREMENT_NOT_FOUND',
            ErrorCode.NOT_FOUND,
          );
        }
      }

      await queryRunner.commitTransaction();
      return {
        code: 200,
        message: 'ok',
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // 치수규칙 관련
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  async getTemplateListByMeasurementRuleId(
    measurementRuleId: string,
  ): Promise<TemplateListResponseDto[]> {
    const templates = await this.templateRepository.find({
      where: { measurementRuleId },
      order: { createdDate: 'DESC' },
    });

    return templates.map((template) => ({
      ...template,
      chartTypes: [],
      // 추후 차트 유형이 필요할 경우 주석 해제
    }));
  }
}
