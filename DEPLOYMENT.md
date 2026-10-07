# Инструкция по развертыванию сайта Led VL

## 📋 Оглавление

1. [Важные замечания](#важные-замечания)
2. [Развертывание через Docker (рекомендуется)](#развертывание-через-docker)
3. [Развертывание на обычном хостинге (без Docker)](#развертывание-на-обычном-хостинге)
4. [Настройка переменных окружения](#настройка-переменных-окружения)
5. [Настройка базы данных](#настройка-базы-данных)
6. [Решение проблем](#решение-проблем)

---

## ⚠️ Важные замечания

**ВНИМАНИЕ:** 
- Next.js — это серверное приложение, а не статический HTML сайт
- У вас НЕ будет файла `index.html` в корне
- Для работы сайта нужен Node.js сервер
- Можно сделать статический экспорт, но с ограниченной функциональностью

---

## 🐳 Развертывание через Docker (рекомендуется)

Docker — самый простой способ запустить весь сайт одной командой.

### Шаг 1: Установка Docker

Если у вас еще не установлен Docker:
- **Windows/Mac**: Скачайте Docker Desktop с https://www.docker.com/products/docker-desktop
- **Linux**: Установите через пакетный менеджер вашего дистрибутива

### Шаг 2: Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```bash
# База данных PostgreSQL
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password
DB_DATABASE=ledvl

# Backend
BACKEND_PORT=3001
JWT_SECRET=your-very-long-random-secret-key-change-this
FRONTEND_URL=http://localhost:3000

# S3 / MinIO
S3_ENDPOINT=http://minio:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=ledvl
S3_PORT=9000
S3_CONSOLE_PORT=9001

# Frontend
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Шаг 3: Запуск через Docker Compose

```bash
# Собрать и запустить все сервисы
docker-compose up -d

# Проверить статус
docker-compose ps

# Посмотреть логи
docker-compose logs -f

# Остановить все
docker-compose down
```

После запуска:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Документация**: http://localhost:3001/api
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)

### Шаг 4: Инициализация базы данных

Выполните миграции базы данных:

```bash
# Войти в контейнер backend
docker exec -it ledvl-backend sh

# Или выполнить миграции снаружи
docker exec ledvl-backend node -e "console.log('Миграции нужно выполнить вручную через psql')"
```

Миграции находятся в `backend/migrations/`. Их можно выполнить через любой PostgreSQL клиент.

---

## 🌐 Развертывание на обычном хостинге (без Docker)

### Вариант 1: Хостинг с поддержкой Node.js (рекомендуется)

Многие хостинги поддерживают Node.js:
- Vercel (для Next.js)
- Heroku
- DigitalOcean App Platform
- Railway
- Render

#### Для Vercel (Frontend):

1. Установите Vercel CLI: `npm i -g vercel`
2. Перейдите в папку `frontend`
3. Создайте файл `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-domain.com
   ```
4. Выполните: `vercel`

#### Для обычного VPS с Node.js:

**Backend:**

```bash
# 1. Подключитесь к серверу по SSH

# 2. Установите Node.js 20+ и PostgreSQL
sudo apt update
sudo apt install -y nodejs npm postgresql

# 3. Клонируйте проект
git clone <your-repo> /var/www/ledvl
cd /var/www/ledvl/backend

# 4. Установите зависимости
npm install

# 5. Создайте .env файл
nano .env
# (скопируйте настройки из раздела "Настройка переменных окружения")

# 6. Соберите проект
npm run build

# 7. Установите PM2 для управления процессом
npm install -g pm2

# 8. Запустите backend
pm2 start dist/main.js --name ledvl-backend
pm2 save
pm2 startup
```

**Frontend:**

```bash
# 1. В папке frontend
cd /var/www/ledvl/frontend

# 2. Установите зависимости
npm install

# 3. Создайте .env.local
echo "NEXT_PUBLIC_API_URL=https://api.yourdomain.com" > .env.local

# 4. Соберите проект
npm run build

# 5. Запустите через PM2
pm2 start npm --name ledvl-frontend -- start
pm2 save
```

**Настройка Nginx (обратный прокси):**

```nginx
# /etc/nginx/sites-available/ledvl
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Вариант 2: Статический экспорт (только для простых сайтов)

**ВНИМАНИЕ:** Статический экспорт имеет ограничения:
- Не будет работать админ-панель
- Некоторые динамические функции могут не работать
- Нужен отдельный backend API

Для создания статического экспорта:

```bash
cd frontend

# Обновите next.config.js - добавьте:
# output: 'export',

# Соберите статический сайт
npm run build

# Файлы будут в папке frontend/out/
# Загрузите содержимое папки out/ на ваш хостинг
```

---

## ⚙️ Настройка переменных окружения

### Backend (.env в папке backend/)

```env
# База данных
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=ledvl

# Сервер
PORT=3001
NODE_ENV=production

# JWT Secret (ОБЯЗАТЕЛЬНО измените на случайную строку!)
JWT_SECRET=generate-random-string-here-min-32-chars

# Frontend URL для CORS
FRONTEND_URL=https://yourdomain.com

# S3 настройки (для MinIO)
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=ledvl

# Для реального S3 (AWS, DigitalOcean Spaces и т.д.):
# S3_ENDPOINT=https://your-region.digitaloceanspaces.com
# S3_ACCESS_KEY=your_access_key
# S3_SECRET_KEY=your_secret_key
# S3_BUCKET=your_bucket_name
```

### Frontend (.env.local в папке frontend/)

```env
# API URL (адрес вашего backend)
NEXT_PUBLIC_API_URL=http://localhost:3001

# WhatsApp номер (необязательно)
NEXT_PUBLIC_WHATSAPP_PHONE=79999999999
```

---

## 🗄️ Настройка базы данных

### Выполнение миграций

Миграции находятся в `backend/migrations/`. Выполните их в порядке:

```bash
# Через psql
psql -U postgres -d ledvl -f backend/migrations/001-initial-schema.sql
psql -U postgres -d ledvl -f backend/migrations/002-add-filters.sql
psql -U postgres -d ledvl -f backend/migrations/003-add-featured-products.sql

# Или через Docker
docker exec -i ledvl-postgres psql -U postgres -d ledvl < backend/migrations/001-initial-schema.sql
docker exec -i ledvl-postgres psql -U postgres -d ledvl < backend/migrations/002-add-filters.sql
docker exec -i ledvl-postgres psql -U postgres -d ledvl < backend/migrations/003-add-featured-products.sql
```

### Создание админа

```bash
# Через скрипт (требует Node.js)
cd backend
npm run update:admin

# Или вручную через psql
psql -U postgres -d ledvl
INSERT INTO admins (email, password_hash) VALUES ('admin@example.com', 'хеш_пароля');
```

---

## 🔧 Решение проблем

### Проблема: "Docker не запускает сайт, localhost не доступен"

**Решение:**
1. Убедитесь, что Docker запущен
2. Проверьте логи: `docker-compose logs`
3. Проверьте, что порты не заняты: `netstat -an | grep 3000` (или `lsof -i :3000`)
4. Убедитесь, что создан файл `.env` в корне проекта

### Проблема: "Отсутствует файл index на сайте"

**Решение:**
- Next.js не создает `index.html` в корне — это нормально
- Используйте Docker или запустите через `npm run start` в папке frontend
- Для статического хостинга используйте статический экспорт (см. выше)

### Проблема: "База данных не подключается"

**Решение:**
1. Проверьте переменные окружения в `.env`
2. Убедитесь, что PostgreSQL запущен
3. Проверьте права доступа к базе данных
4. В Docker проверьте, что сервисы в одной сети

### Проблема: "API возвращает ошибки CORS"

**Решение:**
1. Проверьте `FRONTEND_URL` в backend `.env`
2. Убедитесь, что URL совпадает с реальным адресом фронтенда

### Проблема: "Изображения не загружаются"

**Решение:**
1. Проверьте настройки S3/MinIO
2. Убедитесь, что папка `backend/uploads` существует и доступна
3. Проверьте права на запись в папку uploads

---

## 📦 Сборка готового сайта для хостинга

Если вам нужен готовый собранный сайт для загрузки на хостинг:

```bash
# 1. Соберите backend
cd backend
npm install
npm run build
# Результат в папке backend/dist/

# 2. Соберите frontend
cd ../frontend
npm install
npm run build
# Результат в папке frontend/.next/ и frontend/.next/standalone/

# 3. Создайте архив для загрузки
cd ..
tar -czf ledvl-production.tar.gz \
  backend/dist \
  backend/migrations \
  backend/uploads \
  backend/package.json \
  backend/package-lock.json \
  frontend/.next \
  frontend/package.json \
  frontend/package-lock.json \
  frontend/public

# 4. Загрузите на сервер и распакуйте
# На сервере:
tar -xzf ledvl-production.tar.gz
cd backend && npm ci --only=production
cd ../frontend && npm ci --only=production
```

---

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи: `docker-compose logs` или `pm2 logs`
2. Убедитесь, что все переменные окружения настроены правильно
3. Проверьте, что база данных доступна и миграции выполнены

---

**Важно:** Никогда не публикуйте файлы `.env` или `.env.local` в репозиторий! Они содержат секретные данные.

