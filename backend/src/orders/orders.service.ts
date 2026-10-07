import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  async create(data: Partial<Order>) {
    const order = this.ordersRepository.create(data);
    return await this.ordersRepository.save(order);
  }

  async findAll() {
    return this.ordersRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string) {
    return this.ordersRepository.findOne({ where: { id } });
  }

  async updateStatus(id: string, status: OrderStatus) {
    await this.ordersRepository.update(id, { status });
    return this.findOne(id);
  }
}

