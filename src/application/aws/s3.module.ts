import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';

@Module({
  providers: [S3Service],
  exports: [S3Service], // 꼭 export 해야 다른 모듈에서 사용 가능
})
export class S3Module {}
