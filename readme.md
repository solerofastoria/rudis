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

🛠 Backend

#Node.js (Express).
#equelize ORM.
PostgreSQL.
Redis.
JWT авторизация.
Middleware + Controllers архитектура

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

🎯 Функционал

Регистрация

Авторизация

JWT токены + защита маршрутов

Генерация уникального username

Проверка токена на стороне фронтенда

Полный CI/CD-friendly Docker стек
📘 Документация API (Backend)

🛡 Аутентификация (Auth)
🔹 1. Регистрация пользователя
POST /api/auth/register
📤 Пример запроса (body)

```txt
{
  "email": "test@example.com",
  "password": "123456",
  "username": "testuser"
}
```

⚠️ username не обязательно — создаётся автоматически из email.

📥 Пример ответа (успех)
```txt
{
  "success": true,
  "message": "Регистрация успешна",
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com"
    },
    "token": "jwt_token"
  }
}
```
🍪 Cookie

Сервер устанавливает:
```txt
Set-Cookie: token=JWT; HttpOnly; SameSite=Lax
```
🔹 2. Вход пользователя
POST /api/auth/login
📤 Пример запроса (body)
```txt
{
  "email": "test@example.com",
  "password": "123456"
}
```
📥 Пример ответа
```txt
{
  "success": true,
  "message": "Вход выполнен",
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com"
    },
    "token": "jwt_token"
  }
}
```
🍪 Cookie

Устанавливается cookie "token"
(хранится безопасно, httpOnly).

🔹 3. Получение данных о себе (требуется авторизация)
GET /api/auth/me
🔐 Требуется cookie token
📥 Пример ответа
```txt
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com"
    }
  }
}
```

Если токен неверный / нет cookie:
```txt
{
  "success": false,
  "message": "Не авторизован"
}
```

🔹 4. Выход (очистка cookie)
POST /api/auth/logout
📥 Пример ответа:
{
```txt
  "success": true,
  "message": "Выход выполнен",
  "data": null
}
```
🍪 Cookie очищается:
Set-Cookie: token=""; Max-Age=0

⚙ Системные методы
🔹 5. Проверка состояния сервера
GET /api/health
📥 Пример ответа:
```txt
{
  "status": "OK",
  "message": "Express сервер работает",
  "timestamp": "2025-11-18T12:00:00.000Z",
  "environment": "development"
}
```
🔹 6. Тестовый метод
GET /api/test
📥 Пример ответа:
```txt
{
  "message": "API работает!",
  "endpoints": [
    "/api/health",
    "/api/test",
    "/api/db-check"
  ]
}
```
🔹 7. Проверка подключения к БД
GET /api/db-check
📥 Пример успешного ответа:
```txt
{
  "status": "SUCCESS",
  "message": "База данных подключена успешно!",
  "timestamp": "2025-11-18T12:00:00.000Z"
}
```
📥 Пример ошибки:
```txt
{
  "status": "ERROR",
  "message": "Не удалось подключиться к базе данных",
  "error": "database timeout",
  "solution": "Проверьте что контейнеры запущены: docker ps"
}
```
