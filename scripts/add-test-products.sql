-- Скрипт для добавления тестовых товаров в базу данных

-- Создаем категории, если их нет
INSERT INTO categories (id, name, slug) 
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Новый год 2026', 'novyy-god-2026'),
  ('00000000-0000-0000-0000-000000000002', 'Солнечные светильники (LedVL солнечные)', 'solnechnye-svetilniki-ledvl'),
  ('00000000-0000-0000-0000-000000000003', 'Прайс LedVL', 'prays-ledvl')
ON CONFLICT (slug) DO NOTHING;

-- Добавляем тестовые товары для категории "Новый год 2026"
INSERT INTO products (id, name, article, base_price, wholesale_price, color, category_id, specs, is_available, stock_count, currency, created_at, updated_at)
VALUES 
  ('10000000-0000-0000-0000-000000000001', 'тест 1', 'TEST-001', 1500.00, 1200.00, 'Красный', '00000000-0000-0000-0000-000000000001', '{"technical": "LED, IP65, 12V"}', true, 10, 'RUB', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000002', 'тест 2', 'TEST-002', 2000.00, 1700.00, 'Синий', '00000000-0000-0000-0000-000000000001', '{"technical": "LED, IP65, 24V, RGB"}', true, 5, 'RUB', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000003', 'тест 3', 'TEST-003', 1800.00, 1500.00, 'Зеленый', '00000000-0000-0000-0000-000000000001', '{"technical": "LED, IP54, 12V"}', false, 0, 'RUB', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000004', 'тест 4', 'TEST-004', 2500.00, 2200.00, 'Красный', '00000000-0000-0000-0000-000000000001', '{"technical": "LED, IP65, 24V, RGB, диммер"}', true, 15, 'RUB', NOW(), NOW())
ON CONFLICT (article) DO UPDATE SET
  name = EXCLUDED.name,
  base_price = EXCLUDED.base_price,
  wholesale_price = EXCLUDED.wholesale_price,
  color = EXCLUDED.color,
  category_id = EXCLUDED.category_id,
  specs = EXCLUDED.specs,
  is_available = EXCLUDED.is_available,
  stock_count = EXCLUDED.stock_count,
  updated_at = NOW();

-- Добавляем тестовые товары для категории "Солнечные светильники"
INSERT INTO products (id, name, article, base_price, vendor_model, category_id, specs, dims, is_available, stock_count, currency, created_at, updated_at)
VALUES 
  ('10000000-0000-0000-0000-000000000005', 'тест 5', 'TEST-005', 3500.00, 'Solar-100', '00000000-0000-0000-0000-000000000002', '{"power": "10W", "led_count": 20, "panel_size": "100x100", "battery": "18650 3.7V", "mode": "Автоматический", "area": 10, "params": "Датчик движения, таймер"}', '{"width": 200, "height": 150, "length": 50}', true, 8, 'RUB', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000006', 'тест 6', 'TEST-006', 4200.00, 'Solar-200', '00000000-0000-0000-0000-000000000002', '{"power": "20W", "led_count": 40, "panel_size": "200x200", "battery": "18650 3.7V x2", "mode": "Ручной", "area": 20, "params": "Датчик движения, пульт ДУ"}', '{"width": 300, "height": 200, "length": 80}', true, 12, 'RUB', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000007', 'тест 7', 'TEST-007', 5000.00, 'Solar-300', '00000000-0000-0000-0000-000000000002', '{"power": "30W", "led_count": 60, "panel_size": "300x300", "battery": "18650 3.7V x3", "mode": "Автоматический", "area": 30, "params": "Датчик движения, таймер, пульт ДУ"}', '{"width": 400, "height": 250, "length": 100}', true, 6, 'RUB', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000008', 'тест 8', 'TEST-008', 3800.00, 'Solar-150', '00000000-0000-0000-0000-000000000002', '{"power": "15W", "led_count": 30, "panel_size": "150x150", "battery": "18650 3.7V", "mode": "Автоматический", "area": 15, "params": "Датчик движения"}', '{"width": 250, "height": 180, "length": 60}', false, 0, 'RUB', NOW(), NOW())
ON CONFLICT (article) DO UPDATE SET
  name = EXCLUDED.name,
  base_price = EXCLUDED.base_price,
  vendor_model = EXCLUDED.vendor_model,
  category_id = EXCLUDED.category_id,
  specs = EXCLUDED.specs,
  dims = EXCLUDED.dims,
  is_available = EXCLUDED.is_available,
  stock_count = EXCLUDED.stock_count,
  updated_at = NOW();

-- Добавляем тестовые товары для категории "Прайс LedVL"
INSERT INTO products (id, name, article, base_price, barcode, category_id, is_available, stock_count, currency, created_at, updated_at)
VALUES 
  ('10000000-0000-0000-0000-000000000009', 'тест 9', 'TEST-009', 0.00, '1234567890123', '00000000-0000-0000-0000-000000000003', true, 20, 'RUB', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000010', 'тест 10', 'TEST-010', 0.00, '1234567890124', '00000000-0000-0000-0000-000000000003', true, 15, 'RUB', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000011', 'тест 11', 'TEST-011', 0.00, '1234567890125', '00000000-0000-0000-0000-000000000003', true, 25, 'RUB', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000012', 'тест 12', 'TEST-012', 0.00, '1234567890126', '00000000-0000-0000-0000-000000000003', true, 30, 'RUB', NOW(), NOW())
ON CONFLICT (article) DO UPDATE SET
  name = EXCLUDED.name,
  barcode = EXCLUDED.barcode,
  category_id = EXCLUDED.category_id,
  is_available = EXCLUDED.is_available,
  stock_count = EXCLUDED.stock_count,
  updated_at = NOW();

-- Добавляем записи в прайс-лист для товаров категории "Прайс LedVL"
INSERT INTO price_list_entries (id, product_id, stock_pack_qty, boxes_qty, price, source)
VALUES 
  ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000009', 10, 50, 1000.00, 'Прайс LedVL'),
  ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000010', 11, 60, 1100.00, 'Прайс LedVL'),
  ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000011', 12, 70, 1200.00, 'Прайс LedVL'),
  ('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000012', 13, 80, 1300.00, 'Прайс LedVL')
ON CONFLICT DO NOTHING;

