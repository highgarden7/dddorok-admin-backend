import { TypeOrmModule } from '@nestjs/typeorm';
import { MeasurementRule } from 'src/domain/mesurement-rule/measurement-rule.entity';
import { MeasurementRuleItem } from 'src/domain/measurement-rule-item/measurement-rule-item.entity';
import { MeasurementRuleService } from 'src/application/measurement-rule/measurement-rule.service';
import { MeasurementRuleController } from './measurement-rule.controller';
import { Module } from '@nestjs/common';
import { MeasurementItemCode } from 'src/domain/measurement-rule-item/measurement-rule-item-code.entity';
import { TemplateModule } from '../template/template.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MeasurementRule,
      MeasurementRuleItem,
      MeasurementItemCode,
    ]),
    TemplateModule,
  ],
  providers: [MeasurementRuleService],
  controllers: [MeasurementRuleController],
})
export class MeasurementRuleModule {}
