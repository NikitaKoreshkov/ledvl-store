import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { PriceListEntry } from '../entities/price-list-entry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, PriceListEntry])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}

