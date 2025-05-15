import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Resource } from 'src/domain/resource/resource.entity';
import { Repository } from 'typeorm';
import { S3Service } from 'src/application/aws/s3.service';

@Injectable()
export class ResourceCleanupTask {
  private readonly logger = new Logger(ResourceCleanupTask.name);

  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
    private readonly s3Service: S3Service,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleResourceCleanup() {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const unusedResources = await this.resourceRepository
      .createQueryBuilder('resource')
      .where('resource.createdDate < :threeDaysAgo', { threeDaysAgo })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('1')
          .from('chart_type', 'chart')
          .where('chart.svg_file_id = resource.id')
          .getQuery();
        return `NOT EXISTS ${subQuery}`;
      })
      .getMany();

    for (const resource of unusedResources) {
      try {
        const key = resource.rscUrl;
        await this.s3Service.deleteFile(key);
        await this.resourceRepository.remove(resource);
        this.logger.log(`🧹 삭제 완료 - S3: ${key} / DB ID: ${resource.id}`);
      } catch (error) {
        this.logger.error(
          `⚠️ 삭제 실패 - ID: ${resource.id} / 이유: ${error.message}`,
        );
      }
    }
  }

  async triggerNow() {
    console.log('[MANUAL] ResourceCleanupTask 수동 실행');
    await this.handleResourceCleanup();
  }
}
