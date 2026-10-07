import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('import_logs')
export class ImportLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'varchar', length: 255 })
  source_file: string;

  @Column({ type: 'jsonb', nullable: true })
  mapped_products: Array<{
    product_id: string;
    article?: string;
    action: 'created' | 'updated' | 'skipped';
  }>;

  @Column({ type: 'jsonb', nullable: true })
  errors: Array<{
    row: number;
    message: string;
    data?: any;
  }>;
}

