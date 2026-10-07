#!/bin/bash

# Скрипт для сборки готового сайта для загрузки на хостинг

set -e

echo "🚀 Сборка Led VL для production..."

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Создаем папку для сборки
BUILD_DIR="production-build"
rm -rf $BUILD_DIR
mkdir -p $BUILD_DIR

echo -e "${YELLOW}📦 Сборка backend...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
    echo "Установка зависимостей backend..."
    npm install
fi
npm run build
cd ..

echo -e "${YELLOW}📦 Сборка frontend...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Установка зависимостей frontend..."
    npm install
fi
npm run build
cd ..

echo -e "${YELLOW}📋 Копирование файлов...${NC}"

# Backend
mkdir -p $BUILD_DIR/backend
cp -r backend/dist $BUILD_DIR/backend/
cp -r backend/migrations $BUILD_DIR/backend/
cp backend/package.json $BUILD_DIR/backend/
cp backend/package-lock.json $BUILD_DIR/backend/ 2>/dev/null || true
mkdir -p $BUILD_DIR/backend/uploads

# Frontend (standalone build)
if [ -d "frontend/.next/standalone" ]; then
    cp -r frontend/.next/standalone $BUILD_DIR/frontend/
    cp -r frontend/.next/static $BUILD_DIR/frontend/.next/
    cp -r frontend/public $BUILD_DIR/frontend/ 2>/dev/null || true
else
    echo "⚠️  Standalone сборка не найдена, копируем всю папку .next"
    cp -r frontend/.next $BUILD_DIR/frontend/
    cp -r frontend/public $BUILD_DIR/frontend/ 2>/dev/null || true
    cp frontend/package.json $BUILD_DIR/frontend/
    cp frontend/package-lock.json $BUILD_DIR/frontend/ 2>/dev/null || true
fi

# Документация
cp DEPLOYMENT.md $BUILD_DIR/ 2>/dev/null || true
cp PROJECT_STRUCTURE.md $BUILD_DIR/ 2>/dev/null || true

# Docker файлы
cp docker-compose.yml $BUILD_DIR/ 2>/dev/null || true
cp -r backend/Dockerfile $BUILD_DIR/backend/ 2>/dev/null || true
cp -r frontend/Dockerfile $BUILD_DIR/frontend/ 2>/dev/null || true

echo -e "${GREEN}✅ Сборка завершена!${NC}"
echo ""
echo "📁 Собранные файлы находятся в папке: $BUILD_DIR"
echo ""
echo "📝 Следующие шаги:"
echo "1. Скопируйте папку $BUILD_DIR на ваш сервер"
echo "2. Настройте переменные окружения (.env файлы)"
echo "3. Запустите через Docker или PM2 (см. DEPLOYMENT.md)"
echo ""
echo "💡 Для создания архива выполните:"
echo "   tar -czf ledvl-production.tar.gz $BUILD_DIR"

