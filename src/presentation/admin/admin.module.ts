import { Module } from '@nestjs/common';
import { AdminService } from '../../application/admin/admin.service';
import { AdminController } from './admin.controller';
import { Admin } from 'src/domain/admin/admin.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Admin])], // Admin 엔티티만 등록
  providers: [AdminService],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
