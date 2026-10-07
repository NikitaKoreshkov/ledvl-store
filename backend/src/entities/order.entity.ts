import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum OrderStatus {
  NEW = 'new',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.NEW,
  })
  status: OrderStatus;

  @Column({ type: 'jsonb' })
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;

  @Column({ type: 'jsonb' })
  customer_info: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    comment?: string;
  };

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number;
}

