import { Module, Res } from '@nestjs/common';
import { ChartTypeService } from '../../application/chart-type/chart-type.service';
import { ChartTypeController } from './chart-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChartType } from 'src/domain/chart-type/chart-type.entity';
import { ChartTypeCodeMap } from 'src/domain/chart-type/chart-type-code-map.entity';
import { MeasurementItemCode } from 'src/domain/measurement-rule-item/measurement-rule-item-code.entity';
import { MeasurementRule } from 'src/domain/mesurement-rule/measurement-rule.entity';
import { MeasurementRuleItem } from 'src/domain/measurement-rule-item/measurement-rule-item.entity';
import { Resource } from 'src/domain/resource/resource.entity';
import { S3Module } from 'src/application/aws/s3.module';
import { TemplateChartTypeMap } from 'src/domain/template/template-chart-type-map.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChartType,
      ChartTypeCodeMap,
      MeasurementRule,
      MeasurementRuleItem,
      MeasurementItemCode,
      Resource,
      TemplateChartTypeMap,
    ]),
    S3Module,
  ],
  controllers: [ChartTypeController],
  providers: [ChartTypeService],
})
export class ChartTypeModule {}
