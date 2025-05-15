import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getEnvFilePath } from './config/env.config';
import { AuthModule } from './presentation/auth/auth.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { MeasurementRuleModule } from './presentation/measurement-rule/measurement-rule.module';
import { MeasurementRuleItemModule } from './presentation/measurement-rule-item/measurement-rule-item.module';
import { TemplateModule } from './presentation/template/template.module';
import { ChartTypeModule } from './presentation/chart-type/chart-type.module';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { ScheduleModule } from '@nestjs/schedule';
import { ResourceCleanupTask } from './common/task/resource-cleanup.task';
import { Resource } from './domain/resource/resource.entity';
import { S3Module } from './application/aws/s3.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFilePath(),
    }),
    TypeOrmModule.forFeature([Resource]),
    ScheduleModule.forRoot(), // 스케줄링 모듈 추가
    // PostgreSQL 연결 설정 (환경변수 사용)
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      // logging: ['query', 'error'], // or true (query + error + schema)
      // logger: new TypeOrmConsoleLogger(),
      entities: [__dirname + '/**/*.entity.{ts,js}'],
      synchronize: true, // 개발 환경에서만 true; 운영에서는 false 권장
      namingStrategy: new SnakeNamingStrategy(),
    }),
    MulterModule.register({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // ✅ 5MB 제한
      },
    }),
    AuthModule,
    MeasurementRuleModule,
    MeasurementRuleItemModule,
    TemplateModule,
    ChartTypeModule,
    S3Module,
  ],
  providers: [
    ResourceCleanupTask, // 리소스 정리 작업 등록
  ],
})
export class AppModule {}
