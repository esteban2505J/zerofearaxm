import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadService } from './infrastructure/services/upload.service';
import { UploadController } from './infrastructure/controllers/upload.controller';

@Module({
  imports: [ConfigModule],
  providers: [UploadService],
  controllers: [UploadController],
  exports: [UploadService],
})
export class UploadModule {}
