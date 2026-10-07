import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Category } from './category.entity';
import { PriceListEntry } from './price-list-entry.entity';
import { FilterValue } from './filter-value.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 128, unique: true, nullable: true })
  article: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  barcode: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  base_price: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  wholesale_price: number | null;

  @Column({ type: 'char', length: 3, default: 'RUB' })
  currency: string;

  @Column({ type: 'int', default: 0 })
  stock_count: number;

  @Column({ type: 'boolean', default: true })
  is_available: boolean;

  @Column({ type: 'boolean', default: false })
  is_featured: boolean;

  @Column({ type: 'varchar', length: 64, nullable: true })
  color: string | null;

  @Column({ type: 'uuid', nullable: true })
  category_id: string | null;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'jsonb', nullable: true })
  dims: Record<string, any> | null;

  @Column({ type: 'jsonb', nullable: true })
  specs: Record<string, any> | null;

  @Column({ type: 'jsonb', nullable: true })
  images: Array<{ url: string; width?: number; height?: number; size?: string }> | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  vendor_model: string | null;

  @OneToMany(() => PriceListEntry, (entry) => entry.product)
  price_list_entries: PriceListEntry[];

  @ManyToMany(() => FilterValue, (filterValue) => filterValue.products)
  @JoinTable({
    name: 'product_filter_values',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'filter_value_id', referencedColumnName: 'id' },
  })
  filter_values: FilterValue[];
}

