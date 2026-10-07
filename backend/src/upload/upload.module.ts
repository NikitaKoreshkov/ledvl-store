import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { join } from 'path';

@Module({
  imports: [
    MulterModule.register({
      dest: join(process.cwd(), 'uploads', 'images'),
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}

