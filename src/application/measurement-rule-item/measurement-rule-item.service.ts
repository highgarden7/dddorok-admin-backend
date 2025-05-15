import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MeasurementItemCode } from 'src/domain/measurement-rule-item/measurement-rule-item-code.entity';
import { MeasurementCodeResponseDto } from 'src/presentation/measurement-rule-item/dto/measurement-code-response.dto';
import { Repository } from 'typeorm';

@Injectable()
export class MeasurementRuleItemService {
  constructor(
    @InjectRepository(MeasurementItemCode)
    private readonly measurementRuleCodeRepository: Repository<MeasurementItemCode>,
  ) {}

  async findAvailableCodes(
    category?: string,
  ): Promise<MeasurementCodeResponseDto[]> {
    const where = category ? { category } : {};
    const codes = await this.measurementRuleCodeRepository.find({ where });

    return codes.map((def) => ({
      id: def.id,
      category: def.category,
      section: def.section,
      code: def.code,
      label: def.label,
    }));
  }
}
