# Led VL - Структура проекта

## Обзор

Премиальный веб-сайт для продажи осветительных приборов компании Led VL.

## Технологический стек

### Frontend
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Framer Motion
- Zustand (state management)
- React Hook Form

### Backend
- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- JWT Authentication
- Swagger/OpenAPI
- AWS S3 / MinIO

## Структура проекта

```
asSA/
├── frontend/          # Next.js приложение
│   ├── src/
│   │   ├── app/       # Страницы (App Router)
│   │   ├── components/ # React компоненты
│   │   ├── lib/       # Утилиты
│   │   └── store/     # Zustand stores
│   └── package.json
├── backend/           # NestJS приложение
│   ├── src/
│   │   ├── entities/  # TypeORM entities
│   │   ├── products/  # Модуль товаров
│   │   ├── categories/# Модуль категорий
│   │   ├── orders/    # Модуль заказов
│   │   ├── auth/      # Аутентификация
│   │   ├── admin/     # Админ-панель
│   │   ├── import/    # Импорт Excel
│   │   └── storage/   # S3 интеграция
│   └── migrations/    # SQL миграции
├── scripts/           # Скрипты развертывания
└── docker-compose.yml # Docker конфигурация

```

## Основные функции

### Frontend
- Главная страница с Hero-блоком (27x9 grid)
- Каталог товаров с фильтрами и сортировкой
- Страница товара с галереей и табами
- Корзина и оформление заказа
- Админ-панель
- Страницы: О нас, Контакты, Реквизиты, Политика, Оферта

### Backend
- REST API с OpenAPI документацией
- CRUD операции для товаров и категорий
- Импорт товаров из Excel (3 формата)
- Аутентификация через JWT
- Управление заказами
- S3 интеграция для изображений

## Запуск проекта

1. Установить зависимости:
```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

2. Настроить переменные окружения:
- `backend/.env` (см. `backend/.env.example`)
- `frontend/.env.local` (см. `frontend/.env.example`)

3. Запустить Docker контейнеры:
```bash
docker-compose up -d
```

4. Запустить приложения:
```bash
npm run dev
```

## API Endpoints

- `GET /api/v1/products` - Список товаров
- `GET /api/v1/products/:id` - Детали товара
- `POST /api/v1/orders` - Создать заказ
- `POST /api/v1/auth/login` - Вход админа
- `POST /api/v1/import/excel` - Импорт Excel (требует авторизации)
- `GET /api` - Swagger документация

## База данных

PostgreSQL с следующими основными таблицами:
- `products` - Товары
- `categories` - Категории
- `orders` - Заказы
- `admins` - Администраторы
- `import_logs` - Логи импорта
- `price_list_entries` - Прайс-листы

## Цветовая схема

- Background main: `#F5F3F1`
- Background dark: `#0F1113`
- Accent soft: `#A7C7B7`
- Text primary: `#0E151B`
- Text muted: `#6B6F73`

## Шрифты

- Заголовки: Playfair Display (600/700)
- Основной текст: Inter (400/500)

