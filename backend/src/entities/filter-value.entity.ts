import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
import { Filter } from './filter.entity';
import { Product } from './product.entity';

@Entity('filter_values')
export class FilterValue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'uuid' })
  filter_id: string;

  @ManyToOne(() => Filter, (filter) => filter.values, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'filter_id' })
  filter: Filter;

  @Column({ type: 'varchar', length: 255 })
  value: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  display_name: string | null;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  // Для диапазонов
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  min_value: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  max_value: number | null;

  @ManyToMany(() => Product, (product) => product.filter_values)
  products: Product[];
}

