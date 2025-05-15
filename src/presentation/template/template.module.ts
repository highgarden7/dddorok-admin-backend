import { Module } from '@nestjs/common';
import { TemplateService } from '../../application/template/template.service';
import { TemplateController } from './template.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Template } from 'src/domain/template/template.entity';
import { TemplateMeasurementValue } from 'src/domain/template/template-measurement-value.entity';
import { MeasurementRule } from 'src/domain/mesurement-rule/measurement-rule.entity';
import { MeasurementRuleItem } from 'src/domain/measurement-rule-item/measurement-rule-item.entity';
import { TemplateChartTypeMap } from 'src/domain/template/template-chart-type-map.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Template,
      TemplateMeasurementValue,
      MeasurementRule,
      MeasurementRuleItem,
      TemplateChartTypeMap,
    ]),
  ],
  controllers: [TemplateController],
  providers: [TemplateService],
  exports: [TemplateService],
})
export class TemplateModule {}
