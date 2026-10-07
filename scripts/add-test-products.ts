import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Product } from '../backend/src/entities/product.entity';
import { Category } from '../backend/src/entities/category.entity';
import { PriceListEntry } from '../backend/src/entities/price-list-entry.entity';

async function addTestProducts() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'ledvl',
    entities: [Product, Category, PriceListEntry],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✓ Подключение к базе данных установлено');

    const categoryRepo = dataSource.getRepository(Category);
    const productRepo = dataSource.getRepository(Product);
    const priceListRepo = dataSource.getRepository(PriceListEntry);

    // Получаем или создаем категории
    let newYearCategory = await categoryRepo.findOne({ where: { name: 'Новый год 2026' } });
    if (!newYearCategory) {
      newYearCategory = categoryRepo.create({
        name: 'Новый год 2026',
        slug: 'novyy-god-2026',
      });
      newYearCategory = await categoryRepo.save(newYearCategory);
      console.log('✓ Создана категория "Новый год 2026"');
    }

    let solarCategory = await categoryRepo.findOne({ where: { name: 'Солнечные светильники (LedVL солнечные)' } });
    if (!solarCategory) {
      solarCategory = categoryRepo.create({
        name: 'Солнечные светильники (LedVL солнечные)',
        slug: 'solnechnye-svetilniki-ledvl',
      });
      solarCategory = await categoryRepo.save(solarCategory);
      console.log('✓ Создана категория "Солнечные светильники (LedVL солнечные)"');
    }

    let priceListCategory = await categoryRepo.findOne({ where: { name: 'Прайс LedVL' } });
    if (!priceListCategory) {
      priceListCategory = categoryRepo.create({
        name: 'Прайс LedVL',
        slug: 'prays-ledvl',
      });
      priceListCategory = await categoryRepo.save(priceListCategory);
      console.log('✓ Создана категория "Прайс LedVL"');
    }

    // Добавляем тестовые товары
    const testProducts = [
      // Товары для категории "Новый год 2026" (тест 1-4)
      {
        name: 'тест 1',
        article: 'TEST-001',
        base_price: 1500,
        wholesale_price: 1200,
        color: 'Красный',
        category_id: newYearCategory.id,
        specs: { technical: 'LED, IP65, 12V' },
        is_available: true,
        stock_count: 10,
      },
      {
        name: 'тест 2',
        article: 'TEST-002',
        base_price: 2000,
        wholesale_price: 1700,
        color: 'Синий',
        category_id: newYearCategory.id,
        specs: { technical: 'LED, IP65, 24V, RGB' },
        is_available: true,
        stock_count: 5,
      },
      {
        name: 'тест 3',
        article: 'TEST-003',
        base_price: 1800,
        wholesale_price: 1500,
        color: 'Зеленый',
        category_id: newYearCategory.id,
        specs: { technical: 'LED, IP54, 12V' },
        is_available: false,
        stock_count: 0,
      },
      {
        name: 'тест 4',
        article: 'TEST-004',
        base_price: 2500,
        wholesale_price: 2200,
        color: 'Красный',
        category_id: newYearCategory.id,
        specs: { technical: 'LED, IP65, 24V, RGB, диммер' },
        is_available: true,
        stock_count: 15,
      },
      // Товары для категории "Солнечные светильники" (тест 5-8)
      {
        name: 'тест 5',
        article: 'TEST-005',
        base_price: 3500,
        vendor_model: 'Solar-100',
        category_id: solarCategory.id,
        specs: {
          power: '10W',
          led_count: 20,
          panel_size: '100x100',
          battery: '18650 3.7V',
          mode: 'Автоматический',
          area: 10,
          params: 'Датчик движения, таймер',
        },
        dims: { width: 200, height: 150, length: 50 },
        is_available: true,
        stock_count: 8,
      },
      {
        name: 'тест 6',
        article: 'TEST-006',
        base_price: 4200,
        vendor_model: 'Solar-200',
        category_id: solarCategory.id,
        specs: {
          power: '20W',
          led_count: 40,
          panel_size: '200x200',
          battery: '18650 3.7V x2',
          mode: 'Ручной',
          area: 20,
          params: 'Датчик движения, пульт ДУ',
        },
        dims: { width: 300, height: 200, length: 80 },
        is_available: true,
        stock_count: 12,
      },
      {
        name: 'тест 7',
        article: 'TEST-007',
        base_price: 5000,
        vendor_model: 'Solar-300',
        category_id: solarCategory.id,
        specs: {
          power: '30W',
          led_count: 60,
          panel_size: '300x300',
          battery: '18650 3.7V x3',
          mode: 'Автоматический',
          area: 30,
          params: 'Датчик движения, таймер, пульт ДУ',
        },
        dims: { width: 400, height: 250, length: 100 },
        is_available: true,
        stock_count: 6,
      },
      {
        name: 'тест 8',
        article: 'TEST-008',
        base_price: 3800,
        vendor_model: 'Solar-150',
        category_id: solarCategory.id,
        specs: {
          power: '15W',
          led_count: 30,
          panel_size: '150x150',
          battery: '18650 3.7V',
          mode: 'Автоматический',
          area: 15,
          params: 'Датчик движения',
        },
        dims: { width: 250, height: 180, length: 60 },
        is_available: false,
        stock_count: 0,
      },
      // Товары для категории "Прайс LedVL" (тест 9-12)
      {
        name: 'тест 9',
        article: 'TEST-009',
        base_price: 0,
        barcode: '1234567890123',
        category_id: priceListCategory.id,
        is_available: true,
        stock_count: 20,
      },
      {
        name: 'тест 10',
        article: 'TEST-010',
        base_price: 0,
        barcode: '1234567890124',
        category_id: priceListCategory.id,
        is_available: true,
        stock_count: 15,
      },
      {
        name: 'тест 11',
        article: 'TEST-011',
        base_price: 0,
        barcode: '1234567890125',
        category_id: priceListCategory.id,
        is_available: true,
        stock_count: 25,
      },
      {
        name: 'тест 12',
        article: 'TEST-012',
        base_price: 0,
        barcode: '1234567890126',
        category_id: priceListCategory.id,
        is_available: true,
        stock_count: 30,
      },
    ];

    for (let i = 0; i < testProducts.length; i++) {
      const productData = testProducts[i];
      
      // Проверяем, существует ли товар с таким артикулом
      let product = await productRepo.findOne({ where: { article: productData.article } });
      
      if (!product) {
        product = productRepo.create(productData);
        product = await productRepo.save(product);
        console.log(`✓ Создан товар: ${product.name} (${product.article})`);
      } else {
        // Обновляем существующий товар
        Object.assign(product, productData);
        product = await productRepo.save(product);
        console.log(`✓ Обновлен товар: ${product.name} (${product.article})`);
      }

      // Для товаров категории "Прайс LedVL" добавляем записи в прайс-лист
      if (product.category_id === priceListCategory.id) {
        const existingPriceEntry = await priceListRepo.findOne({
          where: { product_id: product.id },
        });

        if (!existingPriceEntry) {
          const priceEntry = priceListRepo.create({
            product_id: product.id,
            stock_pack_qty: 10 + i,
            boxes_qty: 50 + i * 10,
            price: 1000 + i * 100,
            source: 'Прайс LedVL',
          });
          await priceListRepo.save(priceEntry);
          console.log(`  ✓ Добавлена запись в прайс-лист для ${product.name}`);
        }
      }
    }

    console.log('\n✓ Все тестовые товары успешно добавлены!');
    await dataSource.destroy();
  } catch (error) {
    console.error('Ошибка при добавлении тестовых товаров:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

addTestProducts();

