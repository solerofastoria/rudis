#!/bin/bash

# Остановка существующих контейнеров
echo "Остановка существующих контейнеров..."
docker-compose down

# Запуск контейнеров
echo "Запуск контейнеров..."
docker-compose up --build

echo "Приложение доступно по адресу: http://localhost:3000"
echo "API доступно по адресу: http://localhost:5000"