import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FiltersController } from './filters.controller';
import { FiltersService } from './filters.service';
import { Filter } from '../entities/filter.entity';
import { FilterValue } from '../entities/filter-value.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Filter, FilterValue])],
  controllers: [FiltersController],
  providers: [FiltersService],
  exports: [FiltersService],
})
export class FiltersModule {}

