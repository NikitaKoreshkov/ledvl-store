import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Загружаем переменные окружения
dotenv.config({ path: resolve(__dirname, '../.env') });

const testProducts = [
  {
    name: 'LED Светильник настенный "Луна"',
    article: 'LED-001',
    base_price: 2500.00,
    wholesale_price: 2200.00,
    stock_count: 15,
    is_available: true,
    color: 'Белый',
    description: 'Современный настенный светильник с LED подсветкой. Идеально подходит для гостиной или спальни.',
    images: [{ url: 'http://localhost:3001/uploads/images/2.jpg' }],
    specs: {
      power: '12W',
      color_temperature: '3000K',
      dimensions: '300x200x50mm'
    }
  },
  {
    name: 'Потолочный светильник "Солнце"',
    article: 'LED-002',
    base_price: 3500.00,
    wholesale_price: 3000.00,
    stock_count: 8,
    is_available: true,
    color: 'Хром',
    description: 'Элегантный потолочный светильник с регулируемой яркостью.',
    images: [{ url: 'http://localhost:3001/uploads/images/3.jpg' }],
    specs: {
      power: '18W',
      color_temperature: '4000K',
      dimensions: '400x400x100mm'
    }
  },
  {
    name: 'Настольная лампа "Звезда"',
    article: 'LED-003',
    base_price: 1800.00,
    wholesale_price: 1500.00,
    stock_count: 25,
    is_available: true,
    color: 'Черный',
    description: 'Стильная настольная лампа с сенсорным управлением и USB-зарядкой.',
    images: [{ url: 'http://localhost:3001/uploads/images/32.jpg' }],
    specs: {
      power: '8W',
      color_temperature: '2700K-6500K',
      usb_charging: true
    }
  },
  {
    name: 'Торшер напольный "Орион"',
    article: 'LED-004',
    base_price: 4200.00,
    wholesale_price: 3800.00,
    stock_count: 5,
    is_available: true,
    color: 'Серебристый',
    description: 'Высокий напольный торшер с дистанционным управлением и RGB подсветкой.',
    images: [{ url: 'http://localhost:3001/uploads/images/2.jpg' }],
    specs: {
      power: '25W',
      height: '1600mm',
      rgb: true,
      remote_control: true
    }
  },
  {
    name: 'Подвесной светильник "Планета"',
    article: 'LED-005',
    base_price: 5500.00,
    wholesale_price: 4800.00,
    stock_count: 12,
    is_available: true,
    color: 'Золотой',
    description: 'Роскошный подвесной светильник для столовой или кухни. Регулируемая высота подвеса.',
    images: [{ url: 'http://localhost:3001/uploads/images/3.jpg' }],
    specs: {
      power: '30W',
      color_temperature: '3000K',
      adjustable_height: true,
      max_height: '1200mm'
    }
  },
  {
    name: 'Спот светильник "Комета"',
    article: 'LED-006',
    base_price: 1200.00,
    wholesale_price: 1000.00,
    stock_count: 30,
    is_available: true,
    color: 'Белый',
    description: 'Компактный спот-светильник с поворотным механизмом. Отлично подходит для подсветки картин и декора.',
    images: [{ url: 'http://localhost:3001/uploads/images/32.jpg' }],
    specs: {
      power: '5W',
      color_temperature: '4000K',
      rotation: '360°',
      tilt: '±45°'
    }
  }
];

async function createTestProducts() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'ledvl',
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Проверяем, есть ли уже товары
    const countResult = await client.query('SELECT COUNT(*)::int as count FROM products');
    const existingCount = countResult.rows[0].count;
    
    if (existingCount > 0) {
      console.log(`В базе уже есть ${existingCount} товаров. Пропускаем создание тестовых товаров.`);
      await client.end();
      return;
    }

    console.log('Creating test products...');
    
    for (const productData of testProducts) {
      const result = await client.query(
        `INSERT INTO products (
          name, article, base_price, wholesale_price, stock_count, 
          is_available, color, description, currency, images, specs
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, name, article`,
        [
          productData.name,
          productData.article,
          productData.base_price,
          productData.wholesale_price,
          productData.stock_count,
          productData.is_available,
          productData.color,
          productData.description,
          'RUB',
          JSON.stringify(productData.images),
          JSON.stringify(productData.specs)
        ]
      );
      
      const product = result.rows[0];
      console.log(`✓ Created: ${product.name} (${product.article})`);
    }

    console.log(`\n✅ Успешно создано ${testProducts.length} тестовых товаров!`);
    await client.end();
  } catch (error) {
    console.error('Error creating test products:', error);
    await client.end();
    process.exit(1);
  }
}

createTestProducts();

