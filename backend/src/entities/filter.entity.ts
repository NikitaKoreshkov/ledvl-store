import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { FilterValue } from './filter-value.entity';

export enum FilterType {
  SELECT = 'select',
  CHECKBOX = 'checkbox',
  RANGE = 'range',
  TEXT = 'text',
}

@Entity('filters')
export class Filter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  type: FilterType;

  @Column({ type: 'uuid', nullable: true })
  category_id: string | null;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @OneToMany(() => FilterValue, (value) => value.filter)
  values: FilterValue[];
}

