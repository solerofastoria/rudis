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

## 🔐 Аутентификация

JWT + Refresh токены.

| Метод | Эндпоинт | Описание |
|-------|-----------|----------|
| `POST` | `/api/auth/register` | Регистрация |
| `POST` | `/api/auth/login` | Вход |
| `POST` | `/api/auth/logout` | Выход |
| `POST` | `/api/auth/refresh` | Обновление токена |
| `GET`  | `/api/auth/me` | Текущий пользователь |

---

## 👥 Пользователи и Сообщества

| Раздел | Примеры эндпоинтов | Назначение |
|--------|--------------------|-------------|
| **Пользователи** | `/api/users/:id`, `/api/users/search` | Получение и обновление профиля, поиск, друзья |
| **Серверы (Guilds)** | `/api/servers`, `/api/servers/:id` | Создание и управление серверами |
| **Каналы** | `/api/servers/:serverId/channels` | Создание и настройка текстовых/голосовых каналов |

---

## 💬 Сообщения и Реальное время

### REST API
```bash
GET    /api/channels/:channelId/messages
POST   /api/channels/:channelId/messages
PUT    /api/messages/:messageId
DELETE /api/messages/:messageId
```

### WebSocket события
```js
socket.emit('message:send', { channelId, content })
socket.on('message:new', (msg) => ...)
socket.on('message:update', (msg) => ...)
socket.on('message:delete', (id) => ...)
```

---

## 🎤 Голосовая связь (WebRTC)

Два режима:

| Режим | Описание |
|-------|-----------|
| **P2P** | до 4–6 участников, минимальная задержка |
| **SFU** | групповые звонки через медиасервер |

**Signaling через WebSocket:**
```js
socket.emit('voice:offer', { offer, targetUserId })
socket.emit('voice:answer', { answer })
socket.emit('voice:ice-candidate', { candidate })
socket.emit('voice:join', { channelId })
socket.on('voice:user-joined', (user) => ...)
```

---

## 🧱 Модели данных

**User**
```json
{
  "id": "string",
  "username": "string",
  "avatar": "url",
  "status": "online | offline | idle | dnd"
}
```

**Server**
```json
{
  "id": "string",
  "name": "string",
  "ownerId": "string",
  "icon": "url"
}
```

**Channel**
```json
{
  "id": "string",
  "serverId": "string",
  "name": "string",
  "type": "text | voice"
}
```

**Message**
```json
{
  "id": "string",
  "channelId": "string",
  "authorId": "string",
  "content": "string",
  "timestamp": "ISO8601"
}
```

---

## 🧩 Технологии

| Компонент | Технология |
|------------|------------|
| Backend | Node.js + Express / NestJS |
| Database | PostgreSQL |
| Cache / PubSub | Redis |
| Auth | JWT |
| Realtime | WebSocket |
| Voice / Video | WebRTC + SFU |
| Frontend | React / Next.js |

---

## 🚀 Быстрый старт (Dev)

```bash
# 1. Клонирование репозитория
git clone https://github.com/your-org/chat-system

# 2. Установка зависимостей
npm install

# 3. Запуск
npm run dev
```

---

## 📜 Лицензия

MIT © 2025 — Chat System Project.

