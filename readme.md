🎧 Discord Clone — Fullstack (React + Node.js + Docker)



📌 О проекте

Полноценный клон Discord, построенный на современном fullstack-стеке:
авторизация через JWT, хранение пользователей в PostgreSQL, хранение сессий в Redis.

Проект полностью контейнеризован:
Frontend + Backend + PostgreSQL + Redis + Nginx работают внутри Docker.

⚡ Всё запускается одной командой —
```txt
docker compose up -d.
```
📁 Архитектура проекта

```txt
root/
│── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
│
│── frontend/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
│
│── nginx/
│   └── default.conf
│
└── docker-compose.yml
```


🧩 Стек технологий
🎨 Frontend

React + TypeScript.
Vite.
Context API.
JWT Auth.
Axios.
TailwindCSS
Socket.IO для реального времени

🛠 Backend

#Node.js (Express).
#equelize ORM.
PostgreSQL.
Redis.
JWT авторизация.
Middleware + Controllers архитектура
Socket.IO для реального времени

🐳 DevOps & Infrastructure

Docker
Docker Compose
Multi-stage Dockerfile
Nginx reverse proxy
Автоматическая сборка frontend → Nginx

🚀 Запуск проекта
1️⃣ Создать .env в папке /backend
```txt
PORT=5000
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=discord_clone
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=7d

```
2️⃣ Запусти проект
```txt
docker compose up -d
```
3️⃣ Приложение будет доступно по адресу:

Frontend: http://localhost:3000

Backend API: http://localhost:5000

📡 Функционал реального времени

Проект поддерживает чат в реальном времени с использованием Socket.IO:

• Мгновенная отправка и получение сообщений
• Индикаторы набора текста
• Статус подключения пользователей
• Поддержка нескольких пользователей одновременно

🎯 Функционал

Регистрация

Авторизация

JWT токены + защита маршрутов

Генерация уникального username

Проверка токена на стороне фронтенда

Полный CI/CD-friendly Docker стек

Чат в реальном времени с Socket.IO
