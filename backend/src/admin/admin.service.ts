import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Order } from '../entities/order.entity';
import { ImportLog } from '../entities/import-log.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(ImportLog)
    private importLogsRepository: Repository<ImportLog>,
  ) {}

  async getDashboard() {
    const [productsCount, ordersCount, recentOrders, recentImports] = await Promise.all([
      this.productsRepository.count(),
      this.ordersRepository.count(),
      this.ordersRepository.find({
        take: 10,
        order: { created_at: 'DESC' },
      }),
      this.importLogsRepository.find({
        take: 10,
        order: { created_at: 'DESC' },
      }),
    ]);

    return {
      stats: {
        products: productsCount,
        orders: ordersCount,
      },
      recentOrders,
      recentImports,
    };
  }

  async getImportLogs() {
    return this.importLogsRepository.find({
      order: { created_at: 'DESC' },
    });
  }
}

