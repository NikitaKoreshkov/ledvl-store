import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import Fuse from 'fuse.js';
import { Product } from '../entities/product.entity';
import { PriceListEntry } from '../entities/price-list-entry.entity';
import { ImportLog } from '../entities/import-log.entity';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class ImportService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(PriceListEntry)
    private priceListEntriesRepository: Repository<PriceListEntry>,
    @InjectRepository(ImportLog)
    private importLogsRepository: Repository<ImportLog>,
    private storageService: StorageService,
  ) {}

  async importExcel(files: Express.Multer.File[]) {
    const logs: ImportLog[] = [];
    const errors: any[] = [];

    for (const file of files) {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const log = this.importLogsRepository.create({
        source_file: file.originalname,
        mapped_products: [],
        errors: [],
      });

      try {
        if (file.originalname.includes('Новый год 2026')) {
          await this.importNewYear2026(data, log);
        } else if (file.originalname.includes('солнечные')) {
          await this.importSolar(data, log);
        } else if (file.originalname.includes('Прайс')) {
          await this.importPriceList(data, log);
        } else {
          // Если файл не распознан, пробуем импортировать как общий формат
          log.errors.push({
            row: 0,
            message: `Файл "${file.originalname}" не распознан. Ожидаются файлы с названиями содержащими: "Новый год 2026", "солнечные" или "Прайс"`,
          });
        }
      } catch (error: any) {
        log.errors.push({
          row: 0,
          message: error?.message || 'Неизвестная ошибка при обработке файла',
        });
        errors.push(error);
      }

      await this.importLogsRepository.save(log);
      logs.push(log);
    }

    return { logs, errors };
  }

  private async importNewYear2026(data: any[], log: ImportLog) {
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        const article = this.normalizeArticle(row['артикул']);
        let product = await this.findProduct(article, row['штрихкод'], row['название товара']);

        if (!product) {
          product = this.productsRepository.create({
            name: row['название товара'] || '',
            article: article || null,
            base_price: this.parsePrice(row['баз цена']),
            wholesale_price: row['опт цена'] ? this.parsePrice(row['опт цена']) : null,
            color: row['цвет'] || null,
            specs: {
              technical: row['тех характеристика'],
            },
          });
        } else {
          if (row['название товара'] && !product.name) product.name = row['название товара'];
          if (row['баз цена']) product.base_price = this.parsePrice(row['баз цена']);
          if (row['опт цена']) product.wholesale_price = this.parsePrice(row['опт цена']);
          if (row['цвет']) product.color = row['цвет'];
          if (row['тех характеристика']) {
            product.specs = { ...product.specs, technical: row['тех характеристика'] };
          }
        }

        if (row['photo']) {
          const imageUrls = await this.processImage(row['photo'], product.article || `product-${i}`);
          product.images = imageUrls.map((url, idx) => ({ url, size: `${320 * (idx + 1)}` }));
        }

        await this.productsRepository.save(product);
        log.mapped_products.push({
          product_id: product.id,
          article: product.article ?? undefined,
          action: product.id ? 'updated' : 'created',
        });
      } catch (error) {
        log.errors.push({
          row: i + 2,
          message: error.message,
          data: row,
        });
      }
    }
  }

  private async importSolar(data: any[], log: ImportLog) {
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        const article = this.normalizeArticle(row['артикул']);
        let product = await this.findProduct(article, row['штрихкод'], row['модель']);

        if (!product) {
          product = this.productsRepository.create({
            name: row['модель'] || '',
            article: article || null,
            vendor_model: row['модель'] || null,
            specs: {
              power: row['Мощность'],
              led_count: row['Кол-во LED'],
              panel_size: row['Солнечная панель(мм)'],
              battery: row['акб'],
              mode: row['Режим работы'],
              area: row['Площадь освещения(м2)'],
              pack_size: row['размер упаковки'],
              params: row['Параметры'] || row['параметры'],
            },
            dims: this.parseDims(row['Размер светильника(мм)']),
          });
        } else {
          if (row['модель']) product.vendor_model = row['модель'];
          if (row['Мощность']) product.specs = { ...product.specs, power: row['Мощность'] };
          if (row['Кол-во LED']) product.specs = { ...product.specs, led_count: row['Кол-во LED'] };
          if (row['Параметры'] || row['параметры']) {
            product.specs = { ...product.specs, params: row['Параметры'] || row['параметры'] };
          }
        }

        if (row['фото']) {
          const imageUrls = await this.processImage(row['фото'], product.article || `product-${i}`);
          product.images = imageUrls.map((url, idx) => ({ url, size: `${320 * (idx + 1)}` }));
        }

        await this.productsRepository.save(product);
        log.mapped_products.push({
          product_id: product.id,
          article: product.article ?? undefined,
          action: product.id ? 'updated' : 'created',
        });
      } catch (error) {
        log.errors.push({
          row: i + 2,
          message: error.message,
          data: row,
        });
      }
    }
  }

  private async importPriceList(data: any[], log: ImportLog) {
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        const article = this.normalizeArticle(row['артикул']);
        let product = await this.findProduct(article, row['штрихкод'], row['название']);

        if (!product) {
          product = this.productsRepository.create({
            name: row['название'] || '',
            article: article || null,
            barcode: row['штрихкод'] || null,
            base_price: 0,
          });
          await this.productsRepository.save(product);
        }

        const priceEntry = this.priceListEntriesRepository.create({
          product_id: product.id,
          stock_pack_qty: row['Кол-во в уп.'],
          boxes_qty: row['Кол-во в ящ.'],
          price: this.parsePrice(row['цена']),
          source: 'Прайс LedVL',
        });
        await this.priceListEntriesRepository.save(priceEntry);

        log.mapped_products.push({
          product_id: product.id,
          article: product.article ?? undefined,
          action: 'updated',
        });
      } catch (error) {
        log.errors.push({
          row: i + 2,
          message: error.message,
          data: row,
        });
      }
    }
  }

  private normalizeArticle(article: any): string | null {
    if (!article) return null;
    return String(article).trim().toUpperCase();
  }

  private async findProduct(article: string | null, barcode: string | null, name: string | null): Promise<Product | null> {
    if (article) {
      const found = await this.productsRepository.findOne({ where: { article } });
      if (found) return found;
    }

    if (barcode) {
      const found = await this.productsRepository.findOne({ where: { barcode } });
      if (found) return found;
    }

    if (name) {
      const allProducts = await this.productsRepository.find();
      const fuse = new Fuse(allProducts, {
        keys: ['name'],
        threshold: 0.15,
      });
      const results = fuse.search(name);
      if (results.length > 0 && results[0].score !== undefined && results[0].score < 0.15) {
        return results[0].item;
      }
    }

    return null;
  }

  private parsePrice(price: any): number {
    if (!price) return 0;
    const str = String(price).replace(/[^\d.,]/g, '').replace(',', '.');
    return parseFloat(str) || 0;
  }

  private parseDims(dims: any): Record<string, any> | null {
    if (!dims) return null;
    const str = String(dims);
    const match = str.match(/(\d+)\s*[xх]\s*(\d+)(?:\s*[xх]\s*(\d+))?/);
    if (match) {
      return {
        width: parseInt(match[1]),
        height: parseInt(match[2]),
        length: match[3] ? parseInt(match[3]) : undefined,
      };
    }
    return null;
  }

  private async processImage(imageInput: any, productId: string): Promise<string[]> {
    if (typeof imageInput === 'string' && imageInput.startsWith('http')) {
      return [imageInput];
    }
    return [];
  }
}

