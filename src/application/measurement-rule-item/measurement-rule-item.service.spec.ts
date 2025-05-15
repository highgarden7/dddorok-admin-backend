import { Test, TestingModule } from '@nestjs/testing';
import { MeasurementRuleItemService } from './measurement-rule-item.service';

describe('MeasurementRuleItemService', () => {
  let service: MeasurementRuleItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MeasurementRuleItemService],
    }).compile();

    service = module.get<MeasurementRuleItemService>(MeasurementRuleItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
