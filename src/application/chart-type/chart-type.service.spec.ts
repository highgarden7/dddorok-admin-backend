import { Test, TestingModule } from '@nestjs/testing';
import { ChartTypeService } from '../../presentation/chart-type/chart-type.service';

describe('ChartTypeService', () => {
  let service: ChartTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChartTypeService],
    }).compile();

    service = module.get<ChartTypeService>(ChartTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
