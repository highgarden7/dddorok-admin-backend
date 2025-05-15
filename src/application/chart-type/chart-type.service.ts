import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { CustomException } from 'src/common/exception/custom.exception';
import { ErrorCode } from 'src/common/exception/error-code.enum';
import { ChartTypeCodeMap } from 'src/domain/chart-type/chart-type-code-map.entity';
import { ChartType } from 'src/domain/chart-type/chart-type.entity';
import { MeasurementItemCode } from 'src/domain/measurement-rule-item/measurement-rule-item-code.entity';
import { MeasurementRuleItem } from 'src/domain/measurement-rule-item/measurement-rule-item.entity';
import { MeasurementRule } from 'src/domain/mesurement-rule/measurement-rule.entity';
import { ResourceDomain } from 'src/domain/resource/enum/resource-domain.enum';
import { Resource } from 'src/domain/resource/resource.entity';
import {
  ChartTypeDetailResponseDto,
  ChartTypeMeasurementMapDto,
  ChartTypeResponseDto,
} from 'src/presentation/chart-type/dto/chart-type-response.dto';
import { CreateChartTypeDto } from 'src/presentation/chart-type/dto/create-chart-type.dto';
import { DataSource, In, Raw, Repository } from 'typeorm';
import { S3Service } from '../aws/s3.service';
import { decodeFilename } from 'src/common/utils/util';
import { UpdateChartTypeMeasurementCodeMapDto } from 'src/presentation/chart-type/dto/update-chart-type-measurement-code-map.dto';
import { TemplateChartTypeMap } from 'src/domain/template/template-chart-type-map.entity';

@Injectable()
export class ChartTypeService {
  constructor(
    @InjectRepository(ChartType)
    private readonly chartTypeRepository: Repository<ChartType>,

    @InjectRepository(ChartTypeCodeMap)
    private readonly chartTypeCodeMapRepository: Repository<ChartTypeCodeMap>,

    @InjectRepository(MeasurementRule)
    private readonly measurementRuleRepository: Repository<MeasurementRule>,

    @InjectRepository(MeasurementRuleItem)
    private readonly measurementRuleItemRepository: Repository<MeasurementRuleItem>,

    @InjectRepository(MeasurementItemCode)
    private readonly measurementItemCodeRepository: Repository<MeasurementItemCode>,

    @InjectRepository(TemplateChartTypeMap)
    private readonly templateChartTypeMapRepository: Repository<TemplateChartTypeMap>,

    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,

    private readonly dataSource: DataSource,

    private readonly configService: ConfigService,

    private readonly s3Service: S3Service,
  ) {}

  async create(dto: CreateChartTypeDto) {
    return await this.dataSource.transaction(async (manager) => {
      const exists = await this.chartTypeRepository.findOne({
        where: {
          categoryLarge: dto.categoryLarge,
          categoryMedium: dto.categoryMedium,
          section: dto.section,
          detailType: dto.detailType,
        },
      });

      if (exists) {
        throw new CustomException(
          '동일한 차트 유형이 이미 존재합니다.',
          'CHART_TYPE_DUPLICATED',
          ErrorCode.CONFLICT,
        );
      }

      const chartType = this.chartTypeRepository.create({
        name: dto.name,
        categoryLarge: dto.categoryLarge,
        categoryMedium: dto.categoryMedium,
        section: dto.section,
        detailType: dto.detailType,
        measurementItemId: dto.measurementRuleId ?? null,
        svgFileId: dto.resourceId,
      });

      const savedChartType = await manager.save(chartType);

      const measurementCodes = dto.measurementCodeMaps.map(
        (c) => c.measurementCode,
      );
      const codesToMap = await this.measurementItemCodeRepository.find({
        where: { code: In(measurementCodes) },
      });

      const codeMaps = codesToMap.map((codeEntity) => {
        const match = dto.measurementCodeMaps.find(
          (c) => c.measurementCode === codeEntity.code,
        );

        return {
          chartType: savedChartType,
          measurementCode: codeEntity.code,
          pathId: match?.pathId,
        };
      });

      await manager.save(ChartTypeCodeMap, codeMaps);

      return {
        id: savedChartType.id,
        name: savedChartType.name,
        categoryLarge: savedChartType.categoryLarge,
        categoryMedium: savedChartType.categoryMedium,
        section: savedChartType.section,
        detailType: savedChartType.detailType,
        createdDate: savedChartType.createdDate,
        updatedDate: savedChartType.updatedDate,
        measurementCodeMaps: codeMaps.map((codeMap) => ({
          measurementCode: codeMap.measurementCode,
          pathId: codeMap.pathId,
        })),
        svgFileId: savedChartType.svgFileId,
      };
    });
  }

  async getChartTypeList(): Promise<ChartTypeResponseDto[]> {
    const charts = await this.chartTypeRepository
      .createQueryBuilder('chartType')
      .leftJoinAndSelect('chartType.codeMaps', 'codeMap')
      .leftJoin('chartType.templateMaps', 'templateMap')
      .loadRelationCountAndMap(
        'chartType.templateCount',
        'chartType.templateMaps',
      )
      .orderBy('chartType.createdDate', 'DESC')
      .getMany();

    return charts.map((chart) =>
      plainToInstance(
        ChartTypeResponseDto,
        {
          ...chart,
          measurementCodeMaps: chart.codeMaps?.map((map) => ({
            id: map.id,
            measurementCode: map.measurementCode,
            pathId: map.pathId,
          })),
          templateCount: (chart as any).templateCount ?? 0, // loadRelationCountAndMap 결과는 매핑된 필드로 존재
        },
        { excludeExtraneousValues: true },
      ),
    );
  }

  async getChartTypeById(id: string): Promise<ChartTypeDetailResponseDto> {
    const chart = await this.chartTypeRepository.findOne({
      where: { id },
      relations: [
        'codeMaps',
        'svgFile',
        'templateMaps',
        'templateMaps.template', // 반드시 template 조인 포함
      ],
    });

    if (!chart) {
      throw new CustomException(
        `차트 유형(${id})을 찾을 수 없습니다.`,
        'CHART_TYPE_NOT_FOUND',
        ErrorCode.NOT_FOUND,
      );
    }

    // ✅ 측정 항목 매핑 변환
    const measurementCodeMaps: ChartTypeMeasurementMapDto[] =
      chart.codeMaps.map((codeMap) => ({
        measurementCode: codeMap.measurementCode,
        pathId: codeMap.pathId,
      }));

    // ✅ 연결된 템플릿 id, name 리스트 변환
    const templates =
      chart.templateMaps?.map((map) => ({
        id: map.template.id,
        name: map.template.name,
      })) ?? [];

    // ✅ DTO 변환 (내부 camelCase, Swagger 예시는 snake_case 자동)
    return plainToInstance(
      ChartTypeDetailResponseDto,
      {
        id: chart.id,
        name: chart.name,
        categoryLarge: chart.categoryLarge,
        categoryMedium: chart.categoryMedium,
        section: chart.section,
        detailType: chart.detailType,
        createdDate: chart.createdDate,
        updatedDate: chart.updatedDate,
        svgFileUrl: this.s3Service.getPublicUrl(chart.svgFile.rscUrl),
        measurementCodeMaps,
        templates,
      },
      { excludeExtraneousValues: true },
    );
  }

  async updateMeasurementCodeMaps(
    chartTypeId: string,
    dto: UpdateChartTypeMeasurementCodeMapDto,
  ) {
    const chartType = await this.chartTypeRepository.findOne({
      where: { id: chartTypeId },
    });

    if (!chartType) {
      throw new CustomException(
        '차트 유형을 찾을 수 없습니다.',
        'CHART_TYPE_NOT_FOUND',
        ErrorCode.NOT_FOUND,
      );
    }

    const measurementCodes = dto.measurementCodeMaps.map(
      (c) => c.measurementCode,
    );

    const codesToMap = await this.measurementItemCodeRepository.find({
      where: { code: In(measurementCodes) },
    });

    if (codesToMap.length !== measurementCodes.length) {
      throw new CustomException(
        '일부 측정 코드가 존재하지 않습니다.',
        'MEASUREMENT_CODE_INVALID',
        ErrorCode.BAD_REQUEST,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 기존 매핑 삭제
      await queryRunner.manager.delete(ChartTypeCodeMap, {
        chartType: { id: chartType.id },
      });

      // 새로운 매핑 생성
      const codeMaps = codesToMap.map((codeEntity) => {
        const match = dto.measurementCodeMaps.find(
          (c) => c.measurementCode === codeEntity.code,
        );

        return {
          chartType: chartType,
          measurementCode: codeEntity.code,
          pathId: match?.pathId,
        };
      });

      const savedCodeMap = await queryRunner.manager.save(
        ChartTypeCodeMap,
        codeMaps,
      );

      await queryRunner.commitTransaction();

      return {
        id: chartType.id,
        name: chartType.name,
        categoryLarge: chartType.categoryLarge,
        categoryMedium: chartType.categoryMedium,
        section: chartType.section,
        detailType: chartType.detailType,
        createdDate: chartType.createdDate,
        updatedDate: chartType.updatedDate,
        measurementCodeMaps: savedCodeMap.map((codeMap) => ({
          measurementCode: codeMap.measurementCode,
          pathId: codeMap.pathId,
        })),
        svgFileId: chartType.svgFileId,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteChartType(id: string): Promise<void> {
    const chartType = await this.chartTypeRepository.findOne({
      where: { id },
    });

    if (!chartType) {
      throw new CustomException(
        '차트 유형을 찾을 수 없습니다.',
        'CHART_TYPE_NOT_FOUND',
        ErrorCode.NOT_FOUND,
      );
    }

    const count = await this.templateChartTypeMapRepository.count({
      where: {
        chartTypeId: id,
      },
    });

    if (count > 0) {
      throw new CustomException(
        '해당 차트 유형을 사용하는 템플릿이 존재합니다.',
        'CHART_TYPE_IN_USE',
        ErrorCode.CONFLICT,
      );
    }

    await this.chartTypeRepository.delete(id);
  }

  async uploadSvgAndCreateResource(file: Express.Multer.File): Promise<string> {
    return await this.dataSource.transaction(async (manager) => {
      if (!file) {
        throw new CustomException(
          '파일이 첨부되지 않았습니다.',
          'SVG_FILE_REQUIRED',
          ErrorCode.BAD_REQUEST,
        );
      }

      if (file.mimetype !== 'image/svg+xml') {
        throw new CustomException(
          'SVG 형식의 파일만 업로드 가능합니다.',
          'INVALID_FILE_TYPE',
          ErrorCode.BAD_REQUEST,
        );
      }
      // 1. Resource 엔티티 인스턴스 생성
      const resource = manager.create(Resource, {
        name: decodeFilename(file.originalname),
        length: file.size,
        rscUrl: '', // 일단 빈값 (나중에 key 반영)
        domain: ResourceDomain.CHART_TYPE,
      });

      // 2. 먼저 저장하여 id 확보
      const saved = await manager.save(resource);

      // 3. id 기반 S3 키 생성
      const key = `public/chart-svg/${saved.id}.svg`;

      // 4. S3 업로드
      await this.s3Service.uploadFile(key, file);

      // 5. rscUrl 업데이트 후 저장
      saved.rscUrl = key;
      await manager.save(saved); // update

      return saved.id;
    });
  }
}
