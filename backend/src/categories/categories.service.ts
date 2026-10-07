import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async findAll() {
    return this.categoriesRepository.find({
      relations: ['parent', 'children'],
    });
  }

  async findOne(id: string) {
    return this.categoriesRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
  }

  async create(data: Partial<Category>) {
    const category = this.categoriesRepository.create(data);
    return await this.categoriesRepository.save(category);
  }

  async update(id: string, data: Partial<Category>) {
    await this.categoriesRepository.update(id, data);
    return this.findOne(id);
  }

  async delete(id: string) {
    await this.categoriesRepository.delete(id);
  }
}

