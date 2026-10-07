import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { Product } from '../entities/product.entity';
import { PriceListEntry } from '../entities/price-list-entry.entity';
import { ImportLog } from '../entities/import-log.entity';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, PriceListEntry, ImportLog]),
    StorageModule,
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [ImportController],
  providers: [ImportService],
})
export class ImportModule {}
