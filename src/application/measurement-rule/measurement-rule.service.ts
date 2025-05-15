import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { CreateMeasurementRuleDto } from 'src/presentation/measurement-rule/dto/create-measurement-rule.dto';
import { MeasurementRule } from 'src/domain/mesurement-rule/measurement-rule.entity';
import { MeasurementRuleItem } from 'src/domain/measurement-rule-item/measurement-rule-item.entity';
import { CustomException } from 'src/common/exception/custom.exception';
import { ErrorCode } from 'src/common/exception/error-code.enum';
import { MeasurementItemCode } from 'src/domain/measurement-rule-item/measurement-rule-item-code.entity';
import { MeasurementRuleListResponseDto } from 'src/presentation/measurement-rule/dto/measurement-rule-response.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateMeasurementRuleDto } from 'src/presentation/measurement-rule/dto/update-measurement-rule.dto';
import { MeasurementCode } from 'src/domain/measurement-rule-item/enum/measurement-item-code.enum';
import { Template } from 'src/domain/template/template.entity';

@Injectable()
export class MeasurementRuleService {
  constructor(
    @InjectRepository(MeasurementRule)
    private readonly ruleRepository: Repository<MeasurementRule>,
    @InjectRepository(MeasurementRuleItem)
    private readonly itemRepository: Repository<MeasurementRuleItem>,
    @InjectRepository(MeasurementItemCode)
    private readonly masterRepository: Repository<MeasurementItemCode>,
    private readonly dataSource: DataSource,
  ) {}

  async createRule(dto: CreateMeasurementRuleDto): Promise<MeasurementRule> {
    const {
      ruleName,
      categoryLarge,
      categoryMedium,
      categorySmall,
      sleeveType,
      neckLineType,
      measurementCodes,
    } = dto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const isNameExist = await queryRunner.manager.findOne(MeasurementRule, {
        where: { ruleName },
      });
      if (isNameExist) {
        throw new CustomException(
          '중복된 규칙 이름입니다.',
          'RULE_NAME_DUPLICATE',
          ErrorCode.CONFLICT,
        );
      }

      const isComboExist = await queryRunner.manager.findOne(MeasurementRule, {
        where: {
          categorySmall,
          sleeveType: sleeveType ?? null,
          neckLineType: neckLineType ?? null,
        },
      });
      if (isComboExist) {
        throw new CustomException(
          '해당 조합의 규칙이 이미 존재합니다.',
          'RULE_NAME_DUPLICATE',
          ErrorCode.CONFLICT,
        );
      }

      // 규칙 저장
      const rule = await queryRunner.manager.save(
        MeasurementRule,
        queryRunner.manager.create(MeasurementRule, {
          ruleName,
          categoryLarge,
          categoryMedium,
          categorySmall,
          sleeveType,
          neckLineType,
        }),
      );

      // 항목 조회 및 저장
      const masterItems = await queryRunner.manager.find(MeasurementItemCode, {
        where: { code: In(measurementCodes) },
      });

      const foundCodes = masterItems.map((m) => m.code);
      const missingCodes = measurementCodes.filter(
        (code) => !foundCodes.includes(code as MeasurementCode),
      );
      if (missingCodes.length > 0) {
        throw new CustomException(
          `다음 code 값은 유효하지 않습니다: ${missingCodes.join(', ')}`,
          'INVALID_MEASUREMENT_CODES',
          ErrorCode.BAD_REQUEST,
        );
      }

      const items = masterItems.map((master) =>
        queryRunner.manager.create<
          MeasurementRuleItem,
          Partial<MeasurementRuleItem>
        >(MeasurementRuleItem, {
          rule,
          category: master.category,
          section: master.section,
          label: master.label,
          code: master.code,
        }),
      );

      await queryRunner.manager.save(MeasurementRuleItem, items);

      // 관계 포함된 최종 결과 반환
      const result = await queryRunner.manager.findOne(MeasurementRule, {
        where: { id: rule.id },
        relations: ['items'],
      });

      await queryRunner.commitTransaction();
      return result!;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getRullList() {
    const rules = await this.ruleRepository.find({
      // relations: ['items'], // 'templates'는 구현 후 추가
      relations: ['items', 'templates'], // 템플릿 연동 예정
      order: { createdDate: 'DESC' },
    });

    return plainToInstance(
      MeasurementRuleListResponseDto,
      rules.map((rule) => ({
        id: rule.id,
        ruleName: rule.ruleName,
        categoryLarge: rule.categoryLarge,
        categoryMedium: rule.categoryMedium,
        categorySmall: rule.categorySmall,
        sleeveType: rule.sleeveType,
        neckLineType: rule.neckLineType,
        measurementItemCount: rule.items.length,
        // templateCount: 0, // templates 연결
        templateCount: rule.templates?.length || 0, // templates 연결
      })),
      { excludeExtraneousValues: true },
    );
  }

  async getRuleById(id: string): Promise<MeasurementRule> {
    const rule = await this.ruleRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!rule) {
      throw new CustomException(
        '치수 규칙을 찾을 수 없습니다.',
        'RULE_NOT_FOUND',
        ErrorCode.NOT_FOUND,
      );
    }

    return rule;
  }

  async updateRule(
    id: string,
    dto: UpdateMeasurementRuleDto,
  ): Promise<MeasurementRule> {
    const {
      ruleName,
      categoryLarge,
      categoryMedium,
      categorySmall,
      sleeveType,
      neckLineType,
      measurementCodes,
    } = dto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const target = await queryRunner.manager.findOne(MeasurementRule, {
        where: { id },
        relations: ['items'],
      });
      if (!target) {
        throw new CustomException(
          '치수 규칙을 찾을 수 없습니다.',
          'RULE_NOT_FOUND',
          ErrorCode.NOT_FOUND,
        );
      }

      // 중복 이름 체크 (자기 자신 제외)
      const isNameExist = await queryRunner.manager.findOne(MeasurementRule, {
        where: { ruleName },
      });
      if (isNameExist && isNameExist.id !== id) {
        throw new CustomException(
          '중복된 규칙 이름입니다.',
          'RULE_NAME_DUPLICATE',
          ErrorCode.CONFLICT,
        );
      }

      // 중복 조합 체크 (자기 자신 제외)
      const isComboExist = await queryRunner.manager.findOne(MeasurementRule, {
        where: {
          categorySmall,
          sleeveType,
          neckLineType,
        },
      });
      if (isComboExist && isComboExist.id !== id) {
        throw new CustomException(
          '해당 조합의 규칙이 이미 존재합니다.',
          'RULE_COMBINATION_DUPLICATE',
          ErrorCode.CONFLICT,
        );
      }

      // 템플릿 존재 여부 확인
      const templateCount = await queryRunner.manager.count(Template, {
        where: { measurementRuleId: id },
      });

      if (templateCount > 0) {
        throw new CustomException(
          '해당 치수 규칙에 연결된 템플릿이 있어 수정할 수 없습니다.',
          'CANNOT_UPDATE_RULE_WITH_TEMPLATES',
          ErrorCode.CONFLICT,
        );
      }

      // 측정 항목 유효성 확인
      const masterItems = await queryRunner.manager.find(MeasurementItemCode, {
        where: { code: In(measurementCodes) },
      });

      const foundCodes = masterItems.map((m) => m.code);
      const missingCodes = measurementCodes.filter(
        (code) => !foundCodes.includes(code as MeasurementCode),
      );
      if (missingCodes.length > 0) {
        throw new CustomException(
          `다음 code 값은 유효하지 않습니다: ${missingCodes.join(', ')}`,
          'INVALID_MEASUREMENT_CODES',
          ErrorCode.BAD_REQUEST,
        );
      }

      // 기존 항목 제거
      const deleteResult = await queryRunner.manager.delete(
        MeasurementRuleItem,
        {
          ruleId: id,
        },
      );

      console.log('[삭제결과] deleteResult:', deleteResult);

      // rule 수정
      Object.assign(target, {
        ruleName,
        categoryLarge,
        categoryMedium,
        categorySmall,
        sleeveType,
        neckLineType,
      });

      target.items = []; // 메모리상에서도 제거
      await queryRunner.manager.save(target);

      // 항목 재생성
      const items = masterItems.map((master) =>
        queryRunner.manager.create<
          MeasurementRuleItem,
          Partial<MeasurementRuleItem>
        >(MeasurementRuleItem, {
          rule: target,
          category: master.category,
          section: master.section,
          label: master.label,
          code: master.code,
        }),
      );

      await queryRunner.manager.save(MeasurementRuleItem, items);

      const updated = await queryRunner.manager.findOne(MeasurementRule, {
        where: { id },
        relations: ['items'],
      });

      await queryRunner.commitTransaction();
      return updated!;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteRule(id: string): Promise<{ code: number; message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const rule = await queryRunner.manager.findOne(MeasurementRule, {
        where: { id },
      });

      if (!rule) {
        throw new CustomException(
          '치수 규칙을 찾을 수 없습니다.',
          'RULE_NOT_FOUND',
          ErrorCode.NOT_FOUND,
        );
      }

      const templateCount = await queryRunner.manager.count(Template, {
        where: { measurementRuleId: id },
      });

      if (templateCount > 0) {
        throw new CustomException(
          '해당 치수 규칙에 연결된 템플릿이 있어 삭제할 수 없습니다.',
          'CANNOT_DELETE_RULE_WITH_TEMPLATES',
          ErrorCode.CONFLICT,
        );
      }

      await queryRunner.manager.delete(MeasurementRule, { id });

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
}
