import { Test, TestingModule } from '@nestjs/testing';
import { MeasurementRuleItemController } from './measurement-rule-item.controller';
import { MeasurementRuleItemService } from './measurement-rule-item.service';

describe('MeasurementRuleItemController', () => {
  let controller: MeasurementRuleItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeasurementRuleItemController],
      providers: [MeasurementRuleItemService],
    }).compile();

    controller = module.get<MeasurementRuleItemController>(MeasurementRuleItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
