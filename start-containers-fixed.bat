@echo off
echo Остановка существующих контейнеров...
docker-compose -f docker-compose-fixed.yml down

echo Запуск контейнеров...
docker-compose -f docker-compose-fixed.yml up -d

echo Приложение доступно по адресу: http://localhost:3000
echo API доступно по адресу: http://localhost:5000
echo Redis доступен на порту: 6379
pause