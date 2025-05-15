// src/application/measurement-rule/measurement-rule.service.int.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeasurementRuleService } from './measurement-rule.service';
import { MeasurementRule } from 'src/domain/mesurement-rule/measurement-rule.entity';
import { MeasurementRuleItem } from 'src/domain/measurement-rule-item/measurement-rule-item.entity';
import { ConfigModule } from '@nestjs/config';

describe('MeasurementRuleService (통합 테스트)', () => {
  let service: MeasurementRuleService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [MeasurementRule, MeasurementRuleItem],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([MeasurementRule, MeasurementRuleItem]),
      ],
      providers: [MeasurementRuleService],
    }).compile();

    service = module.get<MeasurementRuleService>(MeasurementRuleService);
  });

  afterAll(async () => {
    const conn = service['ruleRepository'].manager.connection;
    await conn.dropDatabase();
    await conn.close();
  });

  describe('createRule()', () => {
    const dto = {
      ruleName: '테스트_규칙',
      categoryLarge: '의류',
      categoryMedium: '상의',
      categorySmall: '스웨터',
      sleeveType: '레글런',
      neckLineType: '라운드넥',
    };

    it('새로운 규칙을 정상적으로 생성할 수 있어야 한다', async () => {
      const result = await service.createRule(dto);

      expect(result).toBeDefined();
      expect(result.ruleName).toBe(dto.ruleName);
      expect(result.categorySmall).toBe(dto.categorySmall);
      expect(result.sleeveType).toBe(dto.sleeveType);
    });

    it('같은 이름의 규칙이 존재할 경우 예외가 발생해야 한다', async () => {
      await service.createRule({
        ruleName: '중복규칙',
        categoryLarge: '의류',
        categoryMedium: '상의',
        categorySmall: '스웨터',
        sleeveType: '1',
        neckLineType: '2',
      });

      await expect(
        service.createRule({
          ruleName: '중복규칙', // 이름은 같게
          categoryLarge: '의류',
          categoryMedium: '상의',
          categorySmall: '스웨터',
          sleeveType: '1',
          neckLineType: '2',
        }),
      ).rejects.toThrow('중복된 규칙 이름입니다.');
    });

    it('같은 조합(categorySmall + sleeveType + neckLineType)이 존재할 경우 예외가 발생해야 한다', async () => {
      const input = {
        ruleName: '조합검증용',
        categoryLarge: '의류',
        categoryMedium: '상의',
        categorySmall: '카디건',
        sleeveType: '라글란',
        neckLineType: '브이넥',
      };
      await service.createRule(input);

      await expect(
        service.createRule({
          ruleName: '다른이름이지만조합중복',
          categoryLarge: '의류',
          categoryMedium: '상의',
          categorySmall: '카디건',
          sleeveType: '라글란',
          neckLineType: '브이넥',
        }),
      ).rejects.toThrow('해당 조합의 규칙이 이미 존재합니다.');
    });
  });
});
