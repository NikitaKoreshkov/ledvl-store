import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Product } from '../entities/product.entity';
import { Order } from '../entities/order.entity';
import { ImportLog } from '../entities/import-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Order, ImportLog])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

