# 🧩 Chat System — Техническая документация

## 📖 Обзор

**Chat System** — это распределённая платформа для обмена сообщениями и голосовой связи, вдохновлённая архитектурой Discord. Система объединяет REST API, WebSocket и WebRTC для общения в реальном времени.

---

## ⚙️ Архитектура

```text
┌────────────┐   HTTP / WebSocket   ┌──────────────┐
│   Client   │◄───────────────────►│    Backend   │
│ (Web App)  │                     │(API + WS + Signal)│
└────────────┘                     └──────────────┘
                                         │
                                         ▼
                             ┌──────────────┐
                             │ PostgreSQL   │
                             │ Redis (Pub/Sub) │
                             └──────────────┘
                                         │
                                         ▼
                                   ┌─────────┐
                                   │   SFU   │
                                   │ (WebRTC)│
                                   └─────────┘
```

### Основные компоненты
- 🌐 **API** — REST/GraphQL интерфейс для данных.
- 🔌 **WebSocket** — обмен событиями в реальном времени.
- 📡 **Signaling Server** — управление WebRTC-сессиями.
- 🧰 **Redis** — Pub/Sub, кэш, статусы пользователей.
- 🐘 **PostgreSQL** — основное хранилище данных.
- 🎧 **SFU-сервер** — маршрутизация медиапотоков для групповых звонков.

---

🚀 RUDIS – Fullstack приложение (Backend + Frontend + Docker)

Это полноценное приложение с авторизацией, JWT-аутентификацией, защищёнными роутами, Docker-инфраструктурой и интеграцией PostgreSQL + Redis.

Проект состоит из двух частей:

Backend — Node.js (Express + Sequelize + PostgreSQL + Redis)

Frontend — React + TypeScript + Vite

Docker — автоматический запуск всего окружения

📁 Структура проекта
rudis/
│
├── backend/
│   ├── src/
│   │   ├── config/        # DB, Redis
│   │   ├── controllers/   # Auth logic
│   │   ├── middleware/    # Auth middleware (JWT)
│   │   ├── models/        # Sequelize models
│   │   ├── routes/        # Routes: /auth
│   │   ├── utils/         # Validators, JWT utils, username generator
│   │   ├── app.js         # Express app
│   │   └── server.js      # Server start
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/         # /login, /register, /app
│   │   ├── context/       # Auth context
│   │   ├── api/           # backend API
│   │   └── App.tsx
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
└── README.md

⚙️ Требования

Перед запуском убедись, что установлено:

Docker + Docker Compose

(опционально) Node.js 20+ — если хочешь запускать без Docker

🚀 Запуск проекта (через Docker)

Самый простой способ — один файл:

docker compose up --build


После запуска будут доступны:

Сервис	URL
Frontend	http://localhost:3000

Backend API	http://localhost:5000

PostgreSQL	порт 5432
Redis	порт 6379
🧩 Переменные окружения
📌 backend/.env
PORT=5000

DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=discord_clone

JWT_SECRET=supersecret_jwt_key
JWT_EXPIRES_IN=7d

REDIS_HOST=redis
REDIS_PORT=6379

📌 frontend/.env
VITE_API_URL=http://localhost:5000

🔧 Локальный запуск (без Docker)
Backend
cd backend
npm install
npm run dev


Сервер поднимется на:

http://localhost:5000

Frontend
cd frontend
npm install
npm run dev


Открой:

http://localhost:5173

🔐 Маршруты Backend
POST /auth/register

Регистрация пользователя
Тело:

{
  "email": "test@mail.com",
  "username": "tester",
  "password": "123456"
}

POST /auth/login

Авторизация
Возвращает JWT токен.

GET /auth/me

Профиль пользователя
Headers:

Authorization: Bearer <token>

🧪 Проверка работы

Открыть фронт:
http://localhost:3000/login

Зарегистрироваться → backend создаёт юзера.

Войти → появляется токен в LocalStorage.

Перейти на защищённый роут:
/app

Нажать “Выйти” → токен удаляется.

🚀 Docker-инфраструктура

Проект использует:

🐳 docker-compose.yml

backend – Node.js Express

frontend – Vite + Nginx (multi-stage build)

postgres — база данных

redis — для сессий/кеша

network – auto-created

Команды Docker

Запуск:

docker compose up --build


Остановка:

docker compose down


Посмотреть логи:

docker compose logs -f backend
docker compose logs -f frontend

✔️ Что реализовано
Backend

✔ Регистрация
✔ Логин
✔ Хэширование паролей
✔ JWT-аутентификация
✔ Middleware защиты роутов
✔ Автогенерация username
✔ Валидация входных данных
✔ Sequelize-модели + миграции
✔ PostgreSQL + Redis интеграция

Frontend

✔ Страницы /login и /register
✔ Защищённый маршрут /app
✔ Хранение токена
✔ Автоматическая авторизация после входа
✔ API-клиент
✔ UI компонентов

Docker

✔ Multi-stage сборка фронта
✔ Nginx сервер
✔ Backend + DB + Redis связаны в сеть
✔ Волюм для PostgreSQL

🎉 Итого

Этот проект полностью готов к развитию:

добавление WebSocket (чат);

каналы/серверы, как в Discord;

список друзей;

аватарки, профили;

уведомления, статусы онлайн.

Хочешь — могу сделать красивый badge-стиль README или оформить как документацию на wiki.

## 📜 Лицензия

MIT © 2025 — Chat System Project.

