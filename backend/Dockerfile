# Dockerfile для Backend (NestJS)

FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package files
COPY package*.json ./
COPY tsconfig*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Production образ
FROM node:20-alpine

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем только production зависимости
RUN npm ci --only=production

# Копируем собранное приложение из builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/migrations ./migrations

# Создаем директорию для загрузок
RUN mkdir -p uploads

# Открываем порт
EXPOSE 3001

# Запускаем приложение
CMD ["node", "dist/main.js"]

