import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, Like, Between, DataSource, In } from 'typeorm';
import { Product } from '../entities/product.entity';
import { PriceListEntry } from '../entities/price-list-entry.entity';
import { Category } from '../entities/category.entity';
import { FilterValue } from '../entities/filter-value.entity';
import { Filter } from '../entities/filter.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(PriceListEntry)
    private priceListEntriesRepository: Repository<PriceListEntry>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async findAll(query: any) {
    const {
      q,
      category,
      min_price,
      max_price,
      sort = 'default',
      page = 1,
      per_page = 12,
      filters,
    } = query;

    const queryBuilder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.price_list_entries', 'price_list_entries')
      .leftJoinAndSelect('product.filter_values', 'filter_values');

    // Если нет никаких условий, просто возвращаем все товары
    const hasAnyCondition = q || category || min_price || max_price || filters;
    
    if (!hasAnyCondition) {
      // Простой случай - возвращаем все товары
      const skip = (parseInt(page) - 1) * parseInt(per_page);
      
      // Используем raw SQL через DataSource для получения данных
      try {
        const totalResult = await this.dataSource.query('SELECT COUNT(*)::text as count FROM products');
        const total = parseInt(totalResult[0]?.count || '0');
        console.log('Raw SQL - Total products in DB:', total);
        
        const rawProducts = await this.dataSource.query(`
          SELECT 
            p.*,
            json_build_object('id', c.id, 'name', c.name) as category
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          ORDER BY p.created_at DESC
          LIMIT $1 OFFSET $2
        `, [parseInt(per_page), skip]);
        
        console.log('Raw SQL - Found products:', rawProducts.length);
        
        // Получаем price_list_entries отдельно
        const productIds = rawProducts.map((p: any) => p.id);
        let priceListEntriesMap: Record<string, any[]> = {};
        if (productIds.length > 0) {
          const placeholders = productIds.map((_, i) => `$${i + 1}`).join(',');
          const priceListEntries = await this.dataSource.query(`
            SELECT product_id, id, stock_pack_qty, boxes_qty, price
            FROM price_list_entries
            WHERE product_id IN (${placeholders})
          `, productIds);
          
          priceListEntries.forEach((entry: any) => {
            if (!priceListEntriesMap[entry.product_id]) {
              priceListEntriesMap[entry.product_id] = [];
            }
            priceListEntriesMap[entry.product_id].push({
              id: entry.id,
              stock_pack_qty: entry.stock_pack_qty,
              boxes_qty: entry.boxes_qty,
              price: parseFloat(entry.price),
            });
          });
        }
        
        // Преобразуем raw данные в формат Product
        const data = rawProducts.map((row: any) => ({
        id: row.id,
        name: row.name,
        article: row.article,
        barcode: row.barcode,
        base_price: parseFloat(row.base_price),
        wholesale_price: row.wholesale_price ? parseFloat(row.wholesale_price) : null,
        color: row.color,
        is_available: row.is_available,
        stock_count: row.stock_count,
        vendor_model: row.vendor_model,
        specs: row.specs,
        dims: row.dims,
        images: row.images,
        category: row.category,
          price_list_entries: priceListEntriesMap[row.id] || [],
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));
      
        return {
          data,
          meta: {
            total,
            page: parseInt(page),
            per_page: parseInt(per_page),
            total_pages: Math.ceil(total / parseInt(per_page)),
          },
        };
      } catch (error) {
        console.error('Error in raw SQL query:', error);
        // Fallback to empty result
        return {
          data: [],
          meta: {
            total: 0,
            page: parseInt(page),
            per_page: parseInt(per_page),
            total_pages: 0,
          },
        };
      }
    }

    if (q) {
      queryBuilder.where(
        '(product.name ILIKE :q OR product.article ILIKE :q OR product.description ILIKE :q)',
        { q: `%${q}%` },
      );
    }

    if (category) {
      if (q) {
        queryBuilder.andWhere('product.category_id = :category', { category });
      } else {
        queryBuilder.where('product.category_id = :category', { category });
      }
    }

    if (min_price || max_price) {
      const priceFilter: any = {};
      if (min_price) priceFilter.min = min_price;
      if (max_price) priceFilter.max = max_price;
      queryBuilder.andWhere('product.base_price BETWEEN :min AND :max', priceFilter);
    }

    if (filters) {
      const filterObj = typeof filters === 'string' ? JSON.parse(filters) : filters;
      
      // Новая система фильтров - фильтруем по значениям фильтров
      // Каждый фильтр применяется отдельно (AND логика)
      for (const filterId of Object.keys(filterObj)) {
        const filterValue = filterObj[filterId];
        
        if (!filterValue) continue;
        
        // Пропускаем старые фильтры
        if (['in_stock', 'color', 'article', 'barcode', 'min_wholesale_price', 'max_wholesale_price',
             'technical_specs', 'vendor_model', 'min_power', 'max_power', 'params', 'min_led_count',
             'max_led_count', 'light_size', 'panel_size', 'battery', 'mode', 'min_area', 'max_area',
             'min_pack_qty', 'max_pack_qty', 'min_boxes_qty', 'max_boxes_qty', 'min_price_list_price',
             'max_price_list_price'].includes(filterId)) {
          continue;
        }
        
        // Если это массив (чекбоксы) - товар должен иметь хотя бы одно из значений
        if (Array.isArray(filterValue) && filterValue.length > 0) {
          queryBuilder.andWhere('filter_values.id IN (:...valueIds)', { valueIds: filterValue });
        }
        // Если это строка (select) - товар должен иметь это значение
        else if (typeof filterValue === 'string' && filterValue.length > 0) {
          queryBuilder.andWhere('filter_values.id = :valueId', { valueId: filterValue });
        }
        // Если это объект с min/max (range) - обрабатываем через базовые поля товара
        else if (typeof filterValue === 'object' && filterValue !== null && 
                 (filterValue.min !== undefined || filterValue.max !== undefined)) {
          // Получаем информацию о фильтре, чтобы понять, какое поле использовать
          const filterRepo = this.dataSource.getRepository(Filter);
          const filter = await filterRepo.findOne({ where: { id: filterId } });
          
          if (filter) {
            const filterName = filter.name.toLowerCase();
            
            // Фильтр "цена" - используем base_price
            if (filterName.includes('цена') || filterName.includes('price')) {
              if (filterValue.min !== undefined && filterValue.max !== undefined) {
                queryBuilder.andWhere('product.base_price BETWEEN :min_price AND :max_price', {
                  min_price: filterValue.min,
                  max_price: filterValue.max,
                });
              } else if (filterValue.min !== undefined) {
                queryBuilder.andWhere('product.base_price >= :min_price', {
                  min_price: filterValue.min,
                });
              } else if (filterValue.max !== undefined) {
                queryBuilder.andWhere('product.base_price <= :max_price', {
                  max_price: filterValue.max,
                });
              }
            }
          }
        }
      }
      
      // Старые фильтры для обратной совместимости
      // Наличие
      if (filterObj.in_stock) {
        queryBuilder.andWhere('product.is_available = :available', { available: true });
        queryBuilder.andWhere('product.stock_count > 0');
      }
      
      // Цвет
      if (filterObj.color) {
        queryBuilder.andWhere('product.color = :color', { color: filterObj.color });
      }
      
      // Артикул (поиск)
      if (filterObj.article) {
        queryBuilder.andWhere('product.article ILIKE :article', { article: `%${filterObj.article}%` });
      }
      
      // Штрихкод (поиск)
      if (filterObj.barcode) {
        queryBuilder.andWhere('product.barcode ILIKE :barcode', { barcode: `%${filterObj.barcode}%` });
      }
      
      // Оптовая цена (диапазон)
      if (filterObj.min_wholesale_price || filterObj.max_wholesale_price) {
        if (filterObj.min_wholesale_price && filterObj.max_wholesale_price) {
          queryBuilder.andWhere('product.wholesale_price BETWEEN :min_wholesale AND :max_wholesale', {
            min_wholesale: filterObj.min_wholesale_price,
            max_wholesale: filterObj.max_wholesale_price,
          });
        } else if (filterObj.min_wholesale_price) {
          queryBuilder.andWhere('product.wholesale_price >= :min_wholesale', {
            min_wholesale: filterObj.min_wholesale_price,
          });
        } else if (filterObj.max_wholesale_price) {
          queryBuilder.andWhere('product.wholesale_price <= :max_wholesale', {
            max_wholesale: filterObj.max_wholesale_price,
          });
        }
      }
      
      // Технические характеристики (чекбоксы)
      if (filterObj.technical_specs && Array.isArray(filterObj.technical_specs) && filterObj.technical_specs.length > 0) {
        const conditions = filterObj.technical_specs.map((spec: string, index: number) => {
          return `product.specs->>'technical' ILIKE :spec${index}`;
        }).join(' OR ');
        const params: any = {};
        filterObj.technical_specs.forEach((spec: string, index: number) => {
          params[`spec${index}`] = `%${spec}%`;
        });
        queryBuilder.andWhere(`(${conditions})`, params);
      }
      
      // Модель
      if (filterObj.vendor_model) {
        queryBuilder.andWhere('product.vendor_model = :vendor_model', { vendor_model: filterObj.vendor_model });
      }
      
      // Мощность (диапазон)
      if (filterObj.min_power || filterObj.max_power) {
        if (filterObj.min_power && filterObj.max_power) {
          queryBuilder.andWhere(
            "(product.specs->>'power')::numeric BETWEEN :min_power AND :max_power",
            { min_power: filterObj.min_power, max_power: filterObj.max_power }
          );
        } else if (filterObj.min_power) {
          queryBuilder.andWhere(
            "(product.specs->>'power')::numeric >= :min_power",
            { min_power: filterObj.min_power }
          );
        } else if (filterObj.max_power) {
          queryBuilder.andWhere(
            "(product.specs->>'power')::numeric <= :max_power",
            { max_power: filterObj.max_power }
          );
        }
      }
      
      // Параметры (чекбоксы)
      if (filterObj.params && Array.isArray(filterObj.params) && filterObj.params.length > 0) {
        const conditions = filterObj.params.map((param: string, index: number) => {
          return `product.specs->>'params' ILIKE :param${index}`;
        }).join(' OR ');
        const params: any = {};
        filterObj.params.forEach((param: string, index: number) => {
          params[`param${index}`] = `%${param}%`;
        });
        queryBuilder.andWhere(`(${conditions})`, params);
      }
      
      // Количество LED (диапазон)
      if (filterObj.min_led_count || filterObj.max_led_count) {
        if (filterObj.min_led_count && filterObj.max_led_count) {
          queryBuilder.andWhere(
            "(product.specs->>'led_count')::numeric BETWEEN :min_led AND :max_led",
            { min_led: filterObj.min_led_count, max_led: filterObj.max_led_count }
          );
        } else if (filterObj.min_led_count) {
          queryBuilder.andWhere(
            "(product.specs->>'led_count')::numeric >= :min_led",
            { min_led: filterObj.min_led_count }
          );
        } else if (filterObj.max_led_count) {
          queryBuilder.andWhere(
            "(product.specs->>'led_count')::numeric <= :max_led",
            { max_led: filterObj.max_led_count }
          );
        }
      }
      
      // Размер светильника
      if (filterObj.light_size) {
        queryBuilder.andWhere('product.dims::text LIKE :light_size', { light_size: `%${filterObj.light_size}%` });
      }
      
      // Солнечная панель
      if (filterObj.panel_size) {
        queryBuilder.andWhere("product.specs->>'panel_size' = :panel_size", { panel_size: filterObj.panel_size });
      }
      
      // Аккумулятор
      if (filterObj.battery) {
        queryBuilder.andWhere("product.specs->>'battery' = :battery", { battery: filterObj.battery });
      }
      
      // Режим работы
      if (filterObj.mode) {
        queryBuilder.andWhere("product.specs->>'mode' = :mode", { mode: filterObj.mode });
      }
      
      // Площадь освещения (диапазон)
      if (filterObj.min_area || filterObj.max_area) {
        if (filterObj.min_area && filterObj.max_area) {
          queryBuilder.andWhere(
            "(product.specs->>'area')::numeric BETWEEN :min_area AND :max_area",
            { min_area: filterObj.min_area, max_area: filterObj.max_area }
          );
        } else if (filterObj.min_area) {
          queryBuilder.andWhere(
            "(product.specs->>'area')::numeric >= :min_area",
            { min_area: filterObj.min_area }
          );
        } else if (filterObj.max_area) {
          queryBuilder.andWhere(
            "(product.specs->>'area')::numeric <= :max_area",
            { max_area: filterObj.max_area }
          );
        }
      }
      
      // Фильтры для прайс-листа (price_list_entries)
      if (filterObj.min_pack_qty || filterObj.max_pack_qty || 
          filterObj.min_boxes_qty || filterObj.max_boxes_qty ||
          filterObj.min_price_list_price || filterObj.max_price_list_price) {
        queryBuilder.leftJoin('product.price_list_entries', 'ple');
        
        if (filterObj.min_pack_qty || filterObj.max_pack_qty) {
          if (filterObj.min_pack_qty && filterObj.max_pack_qty) {
            queryBuilder.andWhere('ple.stock_pack_qty BETWEEN :min_pack AND :max_pack', {
              min_pack: filterObj.min_pack_qty,
              max_pack: filterObj.max_pack_qty,
            });
          } else if (filterObj.min_pack_qty) {
            queryBuilder.andWhere('ple.stock_pack_qty >= :min_pack', { min_pack: filterObj.min_pack_qty });
          } else if (filterObj.max_pack_qty) {
            queryBuilder.andWhere('ple.stock_pack_qty <= :max_pack', { max_pack: filterObj.max_pack_qty });
          }
        }
        
        if (filterObj.min_boxes_qty || filterObj.max_boxes_qty) {
          if (filterObj.min_boxes_qty && filterObj.max_boxes_qty) {
            queryBuilder.andWhere('ple.boxes_qty BETWEEN :min_boxes AND :max_boxes', {
              min_boxes: filterObj.min_boxes_qty,
              max_boxes: filterObj.max_boxes_qty,
            });
          } else if (filterObj.min_boxes_qty) {
            queryBuilder.andWhere('ple.boxes_qty >= :min_boxes', { min_boxes: filterObj.min_boxes_qty });
          } else if (filterObj.max_boxes_qty) {
            queryBuilder.andWhere('ple.boxes_qty <= :max_boxes', { max_boxes: filterObj.max_boxes_qty });
          }
        }
        
        if (filterObj.min_price_list_price || filterObj.max_price_list_price) {
          if (filterObj.min_price_list_price && filterObj.max_price_list_price) {
            queryBuilder.andWhere('ple.price BETWEEN :min_ple_price AND :max_ple_price', {
              min_ple_price: filterObj.min_price_list_price,
              max_ple_price: filterObj.max_price_list_price,
            });
          } else if (filterObj.min_price_list_price) {
            queryBuilder.andWhere('ple.price >= :min_ple_price', { min_ple_price: filterObj.min_price_list_price });
          } else if (filterObj.max_price_list_price) {
            queryBuilder.andWhere('ple.price <= :max_ple_price', { max_ple_price: filterObj.max_price_list_price });
          }
        }
      }
      
      // Размер светильника
      if (filterObj.light_size) {
        queryBuilder.andWhere(
          "product.dims::text ILIKE :light_size",
          { light_size: `%${filterObj.light_size}%` }
        );
      }
      
      // Солнечная панель
      if (filterObj.panel_size) {
        queryBuilder.andWhere('product.specs->>\'panel_size\' = :panel_size', { panel_size: filterObj.panel_size });
      }
      
      // Аккумулятор
      if (filterObj.battery) {
        queryBuilder.andWhere('product.specs->>\'battery\' = :battery', { battery: filterObj.battery });
      }
      
      // Режим работы
      if (filterObj.mode) {
        queryBuilder.andWhere('product.specs->>\'mode\' = :mode', { mode: filterObj.mode });
      }
      
      // Площадь освещения (диапазон)
      if (filterObj.min_area || filterObj.max_area) {
        if (filterObj.min_area && filterObj.max_area) {
          queryBuilder.andWhere(
            "(product.specs->>'area')::numeric BETWEEN :min_area AND :max_area",
            { min_area: filterObj.min_area, max_area: filterObj.max_area }
          );
        } else if (filterObj.min_area) {
          queryBuilder.andWhere(
            "(product.specs->>'area')::numeric >= :min_area",
            { min_area: filterObj.min_area }
          );
        } else if (filterObj.max_area) {
          queryBuilder.andWhere(
            "(product.specs->>'area')::numeric <= :max_area",
            { max_area: filterObj.max_area }
          );
        }
      }
      
      // Кол-во в упаковке (диапазон)
      if (filterObj.min_pack_qty || filterObj.max_pack_qty) {
        const hasJoin = queryBuilder.expressionMap.joinAttributes.find(j => j.alias.name === 'price_list_entries');
        if (!hasJoin) {
          queryBuilder.leftJoin('product.price_list_entries', 'price_list_entries');
        }
        if (filterObj.min_pack_qty && filterObj.max_pack_qty) {
          queryBuilder.andWhere(
            'price_list_entries.stock_pack_qty BETWEEN :min_pack AND :max_pack',
            { min_pack: filterObj.min_pack_qty, max_pack: filterObj.max_pack_qty }
          );
        } else if (filterObj.min_pack_qty) {
          queryBuilder.andWhere('price_list_entries.stock_pack_qty >= :min_pack', { min_pack: filterObj.min_pack_qty });
        } else if (filterObj.max_pack_qty) {
          queryBuilder.andWhere('price_list_entries.stock_pack_qty <= :max_pack', { max_pack: filterObj.max_pack_qty });
        }
      }
      
      // Кол-во в ящике (диапазон)
      if (filterObj.min_boxes_qty || filterObj.max_boxes_qty) {
        const hasJoin = queryBuilder.expressionMap.joinAttributes.find(j => j.alias.name === 'price_list_entries');
        if (!hasJoin) {
          queryBuilder.leftJoin('product.price_list_entries', 'price_list_entries');
        }
        if (filterObj.min_boxes_qty && filterObj.max_boxes_qty) {
          queryBuilder.andWhere(
            'price_list_entries.boxes_qty BETWEEN :min_boxes AND :max_boxes',
            { min_boxes: filterObj.min_boxes_qty, max_boxes: filterObj.max_boxes_qty }
          );
        } else if (filterObj.min_boxes_qty) {
          queryBuilder.andWhere('price_list_entries.boxes_qty >= :min_boxes', { min_boxes: filterObj.min_boxes_qty });
        } else if (filterObj.max_boxes_qty) {
          queryBuilder.andWhere('price_list_entries.boxes_qty <= :max_boxes', { max_boxes: filterObj.max_boxes_qty });
        }
      }
      
      // Цена из прайса (для солнечных светильников)
      if (filterObj.min_price_list_price || filterObj.max_price_list_price) {
        const hasJoin = queryBuilder.expressionMap.joinAttributes.find(j => j.alias.name === 'price_list_entries');
        if (!hasJoin) {
          queryBuilder.leftJoin('product.price_list_entries', 'price_list_entries');
        }
        if (filterObj.min_price_list_price && filterObj.max_price_list_price) {
          queryBuilder.andWhere(
            'price_list_entries.price BETWEEN :min_ple_price AND :max_ple_price',
            { min_ple_price: filterObj.min_price_list_price, max_ple_price: filterObj.max_price_list_price }
          );
        } else if (filterObj.min_price_list_price) {
          queryBuilder.andWhere('price_list_entries.price >= :min_ple_price', { min_ple_price: filterObj.min_price_list_price });
        } else if (filterObj.max_price_list_price) {
          queryBuilder.andWhere('price_list_entries.price <= :max_ple_price', { max_ple_price: filterObj.max_price_list_price });
        }
      }
    }

    switch (sort) {
      case 'price_asc':
        queryBuilder.orderBy('product.base_price', 'ASC');
        break;
      case 'price_desc':
        queryBuilder.orderBy('product.base_price', 'DESC');
        break;
      case 'popularity':
        queryBuilder.orderBy('product.created_at', 'DESC');
        break;
      case 'date':
        queryBuilder.orderBy('product.created_at', 'DESC');
        break;
      case 'stock':
        queryBuilder.orderBy('product.stock_count', 'DESC');
        break;
      default:
        queryBuilder.orderBy('product.created_at', 'DESC');
    }

    const skip = (parseInt(page) - 1) * parseInt(per_page);
    queryBuilder.skip(skip).take(parseInt(per_page));

    // Для отладки: выводим SQL запрос
    const sql = queryBuilder.getSql();
    const params = queryBuilder.getParameters();
    console.log('SQL Query:', sql);
    console.log('SQL Params:', params);

    const [data, total] = await queryBuilder.getManyAndCount();
    
    console.log('Found products:', data.length, 'Total:', total);

    return {
      data,
      meta: {
        total,
        page: parseInt(page),
        per_page: parseInt(per_page),
        total_pages: Math.ceil(total / parseInt(per_page)),
      },
    };
  }
  
  // Парсинг технических характеристик - извлекает ключевые параметры
  private parseTechnicalSpecs(technical: string): string[] {
    if (!technical) return [];
    const specs = new Set<string>();
    const text = String(technical).toLowerCase();
    
    // Ключевые слова для поиска
    const keywords = [
      'led', 'rgb', 'влагозащита', 'ip65', 'ip67', 'ip68', 'usb', 'usb питание',
      'длина', 'метров', 'м', 'пульт', 'дистанционное управление', 'сенсор',
      'датчик движения', 'автоматическое включение', 'таймер', 'регулировка яркости',
      'диммер', 'теплый белый', 'холодный белый', 'мультицвет', 'белый', 'красный',
      'синий', 'зеленый', 'желтый', 'оранжевый', 'фиолетовый'
    ];
    
    keywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) {
        specs.add(keyword);
      }
    });
    
    // Извлекаем числа с единицами измерения
    const numberPatterns = [
      /(\d+)\s*м/gi, // длина в метрах
      /(\d+)\s*мм/gi, // размеры в миллиметрах
      /(\d+)\s*w/gi, // мощность в ваттах
    ];
    
    numberPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          if (pattern.source.includes('м')) {
            specs.add(`длина ${match[1]} м`);
          } else if (pattern.source.includes('w')) {
            specs.add(`${match[1]}W`);
          }
        }
      }
    });
    
    return Array.from(specs);
  }

  // Парсинг параметров - извлекает повторяющиеся значения
  private parseParams(params: string): string[] {
    if (!params) return [];
    const paramSet = new Set<string>();
    const text = String(params);
    
    // Разделяем по запятым, точкам с запятой, переносам строк
    const parts = text.split(/[,;\n\r]+/).map(p => p.trim()).filter(p => p.length > 0);
    
    parts.forEach(part => {
      // Убираем лишние пробелы и приводим к нормальному виду
      const cleaned = part.replace(/\s+/g, ' ').trim();
      if (cleaned.length > 1) {
        paramSet.add(cleaned);
      }
    });
    
    return Array.from(paramSet);
  }

  // Извлечение числа из строки (например, "12W" -> 12)
  private extractNumber(value: any): number | null {
    if (!value) return null;
    const str = String(value);
    const match = str.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : null;
  }

  // Возвращает пустые опции фильтров
  private getEmptyFilterOptions() {
    return {
      colors: [],
      vendor_models: [],
      panel_sizes: [],
      batteries: [],
      modes: [],
      light_sizes: [],
      technical_specs: [],
      params: [],
      articles: [],
      barcodes: [],
      min_price: 0,
      max_price: 0,
      min_wholesale_price: 0,
      max_wholesale_price: 0,
      min_power: 0,
      max_power: 0,
      min_led_count: 0,
      max_led_count: 0,
      min_area: 0,
      max_area: 0,
      min_pack_qty: 0,
      max_pack_qty: 0,
      min_boxes_qty: 0,
      max_boxes_qty: 0,
      min_price_list_price: 0,
      max_price_list_price: 0,
    };
  }

  async getFilterOptions(categoryId?: string) {
    const queryBuilder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.price_list_entries', 'price_list_entries');
    
    if (categoryId) {
      // Проверяем, является ли categoryId UUID или названием категории
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);
      
      if (isUUID) {
        queryBuilder.where('product.category_id = :categoryId', { categoryId });
      } else {
        // Если это не UUID, ищем категорию по названию
        const categoryRepo = this.dataSource.getRepository(Category);
        const category = await categoryRepo.findOne({ 
          where: { name: categoryId } 
        });
        if (category) {
          queryBuilder.where('product.category_id = :categoryId', { categoryId: category.id });
        } else {
          // Если категория не найдена, возвращаем пустые опции
          return this.getEmptyFilterOptions();
        }
      }
    }
    
    const products = await queryBuilder.getMany();
    
    const options: any = {
      colors: new Set<string>(),
      vendor_models: new Set<string>(),
      panel_sizes: new Set<string>(),
      batteries: new Set<string>(),
      modes: new Set<string>(),
      light_sizes: new Set<string>(),
      technical_specs: new Set<string>(),
      params: new Set<string>(),
      articles: new Set<string>(),
      barcodes: new Set<string>(),
      min_price: Infinity,
      max_price: -Infinity,
      min_wholesale_price: Infinity,
      max_wholesale_price: -Infinity,
      min_power: Infinity,
      max_power: -Infinity,
      min_led_count: Infinity,
      max_led_count: -Infinity,
      min_area: Infinity,
      max_area: -Infinity,
      min_pack_qty: Infinity,
      max_pack_qty: -Infinity,
      min_boxes_qty: Infinity,
      max_boxes_qty: -Infinity,
      min_price_list_price: Infinity,
      max_price_list_price: -Infinity,
    };
    
    products.forEach(product => {
      // Базовые поля
      if (product.color) options.colors.add(product.color);
      if (product.vendor_model) options.vendor_models.add(product.vendor_model);
      if (product.article) options.articles.add(product.article);
      if (product.barcode) options.barcodes.add(product.barcode);
      
      // Цены
      if (product.base_price) {
        const price = Number(product.base_price);
        options.min_price = Math.min(options.min_price, price);
        options.max_price = Math.max(options.max_price, price);
      }
      
      if (product.wholesale_price) {
        const price = Number(product.wholesale_price);
        options.min_wholesale_price = Math.min(options.min_wholesale_price, price);
        options.max_wholesale_price = Math.max(options.max_wholesale_price, price);
      }
      
      // Price list entries
      if (product.price_list_entries && product.price_list_entries.length > 0) {
        product.price_list_entries.forEach((entry: any) => {
          if (entry.price) {
            const price = Number(entry.price);
            options.min_price_list_price = Math.min(options.min_price_list_price, price);
            options.max_price_list_price = Math.max(options.max_price_list_price, price);
          }
          if (entry.stock_pack_qty !== null) {
            const qty = Number(entry.stock_pack_qty);
            options.min_pack_qty = Math.min(options.min_pack_qty, qty);
            options.max_pack_qty = Math.max(options.max_pack_qty, qty);
          }
          if (entry.boxes_qty !== null) {
            const qty = Number(entry.boxes_qty);
            options.min_boxes_qty = Math.min(options.min_boxes_qty, qty);
            options.max_boxes_qty = Math.max(options.max_boxes_qty, qty);
          }
        });
      }
      
      // Specs
      if (product.specs) {
        if (product.specs.panel_size) options.panel_sizes.add(String(product.specs.panel_size));
        if (product.specs.battery) options.batteries.add(String(product.specs.battery));
        if (product.specs.mode) options.modes.add(String(product.specs.mode));
        
        // Мощность - извлекаем число из строки типа "12W"
        if (product.specs.power) {
          const power = this.extractNumber(product.specs.power);
          if (power !== null) {
            options.min_power = Math.min(options.min_power, power);
            options.max_power = Math.max(options.max_power, power);
          }
        }
        
        // Количество LED
        if (product.specs.led_count) {
          const led = this.extractNumber(product.specs.led_count) || Number(product.specs.led_count);
          if (!isNaN(led)) {
            options.min_led_count = Math.min(options.min_led_count, led);
            options.max_led_count = Math.max(options.max_led_count, led);
          }
        }
        
        // Площадь освещения
        if (product.specs.area) {
          const area = this.extractNumber(product.specs.area) || Number(product.specs.area);
          if (!isNaN(area)) {
            options.min_area = Math.min(options.min_area, area);
            options.max_area = Math.max(options.max_area, area);
          }
        }
        
        // Технические характеристики - умный парсинг
        if (product.specs.technical) {
          const techSpecs = this.parseTechnicalSpecs(String(product.specs.technical));
          techSpecs.forEach(spec => options.technical_specs.add(spec));
        }
        
        // Параметры - умный парсинг
        if (product.specs.params) {
          const params = this.parseParams(String(product.specs.params));
          params.forEach(param => options.params.add(param));
        }
      }
      
      // Размеры светильника из dims
      if (product.dims) {
        let sizeStr = '';
        if (product.dims.width && product.dims.height) {
          sizeStr = `${product.dims.width}×${product.dims.height}`;
          if (product.dims.length) {
            sizeStr += `×${product.dims.length}`;
          }
          sizeStr += ' мм';
          options.light_sizes.add(sizeStr);
        }
      }
    });
    
    return {
      colors: Array.from(options.colors).sort(),
      vendor_models: Array.from(options.vendor_models).sort(),
      panel_sizes: Array.from(options.panel_sizes).sort(),
      batteries: Array.from(options.batteries).sort(),
      modes: Array.from(options.modes).sort(),
      light_sizes: Array.from(options.light_sizes).sort(),
      technical_specs: Array.from(options.technical_specs).sort(),
      params: Array.from(options.params).sort(),
      articles: Array.from(options.articles).sort(),
      barcodes: Array.from(options.barcodes).sort(),
      min_price: options.min_price === Infinity ? 0 : options.min_price,
      max_price: options.max_price === -Infinity ? 0 : options.max_price,
      min_wholesale_price: options.min_wholesale_price === Infinity ? 0 : options.min_wholesale_price,
      max_wholesale_price: options.max_wholesale_price === -Infinity ? 0 : options.max_wholesale_price,
      min_power: options.min_power === Infinity ? 0 : options.min_power,
      max_power: options.max_power === -Infinity ? 0 : options.max_power,
      min_led_count: options.min_led_count === Infinity ? 0 : options.min_led_count,
      max_led_count: options.max_led_count === -Infinity ? 0 : options.max_led_count,
      min_area: options.min_area === Infinity ? 0 : options.min_area,
      max_area: options.max_area === -Infinity ? 0 : options.max_area,
      min_pack_qty: options.min_pack_qty === Infinity ? 0 : options.min_pack_qty,
      max_pack_qty: options.max_pack_qty === -Infinity ? 0 : options.max_pack_qty,
      min_boxes_qty: options.min_boxes_qty === Infinity ? 0 : options.min_boxes_qty,
      max_boxes_qty: options.max_boxes_qty === -Infinity ? 0 : options.max_boxes_qty,
      min_price_list_price: options.min_price_list_price === Infinity ? 0 : options.min_price_list_price,
      max_price_list_price: options.max_price_list_price === -Infinity ? 0 : options.max_price_list_price,
    };
  }

  async getArticleAutocomplete(query?: string, categoryId?: string) {
    const queryBuilder = this.productsRepository.createQueryBuilder('product');
    
    queryBuilder.select(['product.article']).where('product.article IS NOT NULL');
    
    if (categoryId) {
      queryBuilder.andWhere('product.category_id = :categoryId', { categoryId });
    }
    
    if (query && query.length > 0) {
      queryBuilder.andWhere('product.article ILIKE :query', { query: `%${query}%` });
    }
    
    queryBuilder.orderBy('product.article', 'ASC').limit(10);
    
    const products = await queryBuilder.getMany();
    return products.map(p => p.article).filter(Boolean);
  }

  async findOne(id: string) {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['category', 'price_list_entries', 'filter_values', 'filter_values.filter'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    console.log('Loading product with images:', product.images);
    return product;
  }

  async getFeaturedProducts() {
    return await this.productsRepository.find({
      where: { is_featured: true, is_available: true },
      relations: ['category', 'price_list_entries'],
      take: 3,
      order: { created_at: 'DESC' },
    });
  }

  async create(data: Partial<Product> & { filter_value_ids?: string[]; is_featured?: boolean }) {
    const { filter_value_ids, is_featured, filter_values, category, price_list_entries, ...productData } = data;
    console.log('Creating product with images:', productData.images);
    
    // Если пытаются установить is_featured = true, проверяем лимит
    if (is_featured === true) {
      const featuredCount = await this.productsRepository.count({ where: { is_featured: true } });
      if (featuredCount >= 3) {
        throw new Error('Максимум 3 товара могут быть популярными. Сначала снимите отметку с другого товара.');
      }
    }
    
    const createData: any = { ...productData };
    if (is_featured !== undefined) {
      createData.is_featured = is_featured;
    }
    
    const product = this.productsRepository.create(createData);
    const savedProduct = await this.productsRepository.save(product);
    
    // Получаем ID сохраненного товара (save может вернуть один объект или массив)
    const productId = Array.isArray(savedProduct) ? savedProduct[0]?.id : (savedProduct as Product)?.id;
    if (!productId) {
      throw new Error('Failed to create product');
    }
    
    // Устанавливаем значения фильтров
    if (filter_value_ids && filter_value_ids.length > 0) {
      const filterValueRepo = this.dataSource.getRepository(FilterValue);
      const filterValues = await filterValueRepo.findBy({ id: In(filter_value_ids) });
      // Получаем полный объект с relations
      const productWithRelations = await this.productsRepository.findOne({ 
        where: { id: productId }, 
        relations: ['filter_values'] 
      });
      if (productWithRelations) {
        productWithRelations.filter_values = filterValues;
        await this.productsRepository.save(productWithRelations);
      }
    }
    
    return this.findOne(productId);
  }

  async update(id: string, data: Partial<Product> & { filter_value_ids?: string[]; is_featured?: boolean }) {
    const { filter_value_ids, is_featured, filter_values, category, price_list_entries, images, specs, dims, ...productData } = data;
    console.log('Updating product with images:', images);
    
    // Если пытаются установить is_featured = true, проверяем лимит
    if (is_featured === true) {
      const featuredCount = await this.productsRepository.count({ where: { is_featured: true } });
      const currentProduct = await this.productsRepository.findOne({ where: { id } });
      const isCurrentlyFeatured = currentProduct?.is_featured;
      
      // Если товар уже популярный, разрешаем
      if (!isCurrentlyFeatured && featuredCount >= 3) {
        throw new Error('Максимум 3 товара могут быть популярными. Сначала снимите отметку с другого товара.');
      }
    }
    
    // Обновляем базовые поля товара
    // Используем save вместо update для правильной обработки JSONB полей (images, specs)
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    
    // Обновляем базовые поля товара
    Object.assign(product, productData);
    
    // Явно устанавливаем JSONB поля, если они переданы
    if (images !== undefined) {
      product.images = images;
    }
    if (specs !== undefined) {
      product.specs = specs;
    }
    if (dims !== undefined) {
      product.dims = dims;
    }
    
    if (is_featured !== undefined) {
      product.is_featured = is_featured;
    }
    
    console.log('Saving product with images:', product.images);
    const saved = await this.productsRepository.save(product);
    console.log('Saved product images:', saved.images);
    
    // Обновляем значения фильтров
    if (filter_value_ids !== undefined) {
      const product = await this.productsRepository.findOne({ where: { id }, relations: ['filter_values'] });
      if (product) {
        if (filter_value_ids.length > 0) {
          const filterValueRepo = this.dataSource.getRepository(FilterValue);
          const filterValues = await filterValueRepo.findBy({ id: In(filter_value_ids) });
          product.filter_values = filterValues;
        } else {
          product.filter_values = [];
        }
        await this.productsRepository.save(product);
      }
    }
    
    return this.findOne(id);
  }

  async delete(id: string) {
    const result = await this.productsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Product not found');
    }
  }
}

