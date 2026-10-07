import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Filter } from '../entities/filter.entity';
import { FilterValue } from '../entities/filter-value.entity';

@Injectable()
export class FiltersService {
  constructor(
    @InjectRepository(Filter)
    private filtersRepository: Repository<Filter>,
    @InjectRepository(FilterValue)
    private filterValuesRepository: Repository<FilterValue>,
  ) {}

  async findAll(categoryId?: string) {
    const queryBuilder = this.filtersRepository
      .createQueryBuilder('filter')
      .leftJoinAndSelect('filter.values', 'values')
      .where('filter.is_active = :isActive', { isActive: true })
      .orderBy('filter.sort_order', 'ASC')
      .addOrderBy('values.sort_order', 'ASC');

    if (categoryId) {
      queryBuilder.andWhere('(filter.category_id = :categoryId OR filter.category_id IS NULL)', { categoryId });
    } else {
      queryBuilder.andWhere('filter.category_id IS NULL');
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string) {
    const filter = await this.filtersRepository.findOne({
      where: { id },
      relations: ['values'],
    });

    if (!filter) {
      throw new NotFoundException('Filter not found');
    }

    return filter;
  }

  async create(data: Partial<Filter>) {
    const filter = this.filtersRepository.create(data);
    return await this.filtersRepository.save(filter);
  }

  async update(id: string, data: Partial<Filter>) {
    await this.filtersRepository.update(id, data);
    return this.findOne(id);
  }

  async delete(id: string) {
    const result = await this.filtersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Filter not found');
    }
  }

  // Управление значениями фильтров
  async createValue(filterId: string, data: Partial<FilterValue>) {
    console.log('Creating filter value for filter:', filterId, 'with data:', data);
    console.log('min_value type:', typeof data.min_value, 'value:', data.min_value);
    console.log('max_value type:', typeof data.max_value, 'value:', data.max_value);
    
    const filter = await this.findOne(filterId);
    
    // Явно создаем объект со всеми полями
    const valueData: any = {
      filter_id: filterId,
      value: data.value || `range_${filterId}`,
      display_name: data.display_name || null,
      sort_order: data.sort_order || 0,
      is_active: data.is_active !== undefined ? data.is_active : true,
    };
    
    // Явно устанавливаем min_value и max_value
    if (data.min_value !== undefined) {
      valueData.min_value = data.min_value !== null ? Number(data.min_value) : null;
    } else {
      valueData.min_value = null;
    }
    
    if (data.max_value !== undefined) {
      valueData.max_value = data.max_value !== null ? Number(data.max_value) : null;
    } else {
      valueData.max_value = null;
    }
    
    console.log('Value data to create:', valueData);
    
    const value = this.filterValuesRepository.create(valueData);
    const valueObj = Array.isArray(value) ? value[0] : value;
    console.log('Value before save:', { min_value: valueObj.min_value, max_value: valueObj.max_value });
    const saved = await this.filterValuesRepository.save(valueObj);
    const savedObj = Array.isArray(saved) ? saved[0] : saved;
    console.log('Value after save:', { min_value: savedObj.min_value, max_value: savedObj.max_value });
    
    // Загружаем заново из БД, чтобы убедиться, что данные сохранились
    const reloaded = await this.filterValuesRepository.findOne({ where: { id: savedObj.id } });
    if (reloaded) {
      console.log('Value after reload from DB:', { min_value: reloaded.min_value, max_value: reloaded.max_value });
      return reloaded;
    }
    
    return savedObj;
  }

  async updateValue(id: string, data: Partial<FilterValue>) {
    console.log('Updating filter value:', id, 'with data:', data);
    console.log('min_value type:', typeof data.min_value, 'value:', data.min_value);
    console.log('max_value type:', typeof data.max_value, 'value:', data.max_value);
    
    // Используем save вместо update, чтобы правильно обрабатывать null значения
    const value = await this.filterValuesRepository.findOne({ where: { id } });
    if (!value) {
      throw new NotFoundException('Filter value not found');
    }
    
    // Явно устанавливаем все поля, включая null значения
    if (data.min_value !== undefined) {
      value.min_value = data.min_value !== null ? Number(data.min_value) : null;
    }
    if (data.max_value !== undefined) {
      value.max_value = data.max_value !== null ? Number(data.max_value) : null;
    }
    if (data.value !== undefined) value.value = data.value;
    if (data.display_name !== undefined) value.display_name = data.display_name;
    
    console.log('Value before save:', { min_value: value.min_value, max_value: value.max_value });
    const saved = await this.filterValuesRepository.save(value);
    console.log('Value after save:', { min_value: saved.min_value, max_value: saved.max_value });
    
    return this.filterValuesRepository.findOne({ where: { id } });
  }

  async deleteValue(id: string) {
    const result = await this.filterValuesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Filter value not found');
    }
  }
}

