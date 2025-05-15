import { Module } from '@nestjs/common';
import { MeasurementRuleItemController } from './measurement-rule-item.controller';
import { MeasurementRuleItemService } from 'src/application/measurement-rule-item/measurement-rule-item.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeasurementItemCode } from 'src/domain/measurement-rule-item/measurement-rule-item-code.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MeasurementItemCode])],
  controllers: [MeasurementRuleItemController],
  providers: [MeasurementRuleItemService],
})
export class MeasurementRuleItemModule {}
