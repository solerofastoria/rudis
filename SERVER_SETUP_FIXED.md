# Исправленная настройка сервера

## Проблема
Изначально сервер не работал по пути http://localhost:5000/api/servers из-за проблем с:
1. Подключением к Redis
2. Ошибками в миграции базы данных
3. Неправильной конфигурацией моделей Sequelize
4. Неправильной конфигурацией подключения к базе данных

## Решение
1. Создан файл `docker-compose-fixed.yml`, который:
   - Открывает порт 6379 для Redis
   - Открывает порт 5432 для PostgreSQL

2. Исправлены миграции базы данных:
   - `backend/migrations/20240521000000-rename-users-columns.js`
   - `backend/migrations/20240521100000-rename-messages-columns.js`
   - `backend/migrations/20240521200000-rename-friends-columns.js`
   - `backend/migrations/20240521300000-rename-servers-columns.js`
   - `backend/migrations/20240521400000-rename-members-columns.js`
   - `backend/migrations/20240521500000-rename-channels-columns.js`
   - Исправлены ошибки в миграциях, которые пытались переименовать уже существующие колонки

3. Исправлена конфигурация моделей:
   - `backend/src/models/index.js` - исправлена конфигурация Sequelize и подключение к базе данных

4. Созданы новые скрипты запуска:
   - `start-containers-fixed.bat` - запуск всех контейнеров с открытыми портами
   - `start-backend-fixed.bat` - запуск бэкенда с правильными переменными окружения

## Как запустить

### Вариант 1: Запуск через Docker (рекомендуется)
1. Запустите `start-containers-fixed.bat`
2. Сервер будет доступен по адресу: http://localhost:5000
3. API для создания серверов: POST http://localhost:5000/api/servers

### Вариант 2: Запуск бэкенда напрямую
1. Запустите Redis и PostgreSQL через Docker:
   ```
   docker-compose -f docker-compose-fixed.yml up -d redis postgres
   ```
2. Запустите `start-backend-fixed.bat`
3. Сервер будет доступен по адресу: http://localhost:5000

## API для создания серверов
Для создания сервера отправьте POST запрос на:
```
POST http://localhost:5000/api/servers/create
```

С заголовками:
```
Authorization: Bearer <ваш_JWT_токен>
Content-Type: application/json
```

С телом запроса:
```json
{
  "name": "Название сервера",
  "region": "eu-west",
  "privacy": "public",
  "template": "default"
}
```

## Возможные проблемы и решения

### Redis Client Error
Если вы видите ошибки подключения к Redis:
1. Убедитесь, что Redis запущен и доступен на порту 6379
2. Проверьте, что порт 6379 не занят другим приложением
3. Используйте `docker-compose-fixed.yml` для запуска контейнеров

### Ошибка миграции таблиц
Если вы видите ошибки типа "Table [table] doesn't have the column [column]":
1. Убедитесь, что вы используете исправленные миграции
2. Попробуйте сбросить базу данных: `npm run db:reset`

### Ошибка "Неверный токен"
Если при создании сервера получаете ошибку "Неверный токен":
1. Убедитесь, что вы авторизованы в приложении
2. Получите новый JWT токен через авторизацию
3. Используйте правильный заголовок Authorization

## Структура API
- `POST /api/servers/create` - создание сервера
- `GET /api/servers` - получение списка серверов пользователя
- `GET /api/servers/:serverId` - получение информации о сервере