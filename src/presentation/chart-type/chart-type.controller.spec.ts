import { Test, TestingModule } from '@nestjs/testing';
import { ChartTypeController } from './chart-type.controller';
import { ChartTypeService } from '../../application/chart-type/chart-type.service';

describe('ChartTypeController', () => {
  let controller: ChartTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChartTypeController],
      providers: [ChartTypeService],
    }).compile();

    controller = module.get<ChartTypeController>(ChartTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
