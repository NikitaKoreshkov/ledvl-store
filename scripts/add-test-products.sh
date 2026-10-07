#!/bin/bash

# Скрипт для добавления тестовых товаров в базу данных

echo "Добавление тестовых товаров в базу данных..."

# Проверяем, запущен ли Docker контейнер
if ! docker ps | grep -q ledvl-postgres; then
  echo "Ошибка: Docker контейнер ledvl-postgres не запущен"
  exit 1
fi

# Выполняем SQL скрипт
docker exec -i ledvl-postgres psql -U postgres -d ledvl < "$(dirname "$0")/add-test-products.sql"

if [ $? -eq 0 ]; then
  echo "✓ Тестовые товары успешно добавлены!"
else
  echo "✗ Ошибка при добавлении тестовых товаров"
  exit 1
fi

