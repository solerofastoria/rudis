# Rudis Frontend

Frontend для Discord-подобного приложения Rudis, построенного с использованием React, TypeScript и Tailwind CSS.

## Основные функции

- Аутентификация (регистрация/вход)
- Чат в реальном времени
- Списки друзей
- Голосовая связь
- Темная/светлая темы

## Технологии

- React 18
- TypeScript
- Tailwind CSS
- React Router v6
- Axios
- Socket.IO Client
- Vite (для сборки)

## Установка и запуск

1. Установите зависимости:
   ```bash
   npm install
   ```

2. Запустите приложение в режиме разработки:
   ```bash
   npm run dev
   ```

3. Сборка для продакшена:
   ```bash
   npm run build
   ```

4. Предварительный просмотр продакшн-сборки:
   ```bash
   npm run preview
   ```

## Структура проекта

```
src/
├── api/              # API клиенты
├── assets/           # Статические ресурсы
├── components/       # Переиспользуемые компоненты
├── context/         # React контексты
├── features/         # Функциональные модули
├── hooks/            # Пользовательские хуки
├── locales/          # Локализация
├── pages/            # Страницы приложения
├── types/           # Общие типы TypeScript
└── utils/            # Вспомогательные функции
```

## Доступные скрипты

- `npm run dev` - Запуск в режиме разработки
- `npm run build` - Сборка для продакшена
- `npm run preview` - Предварительный просмотр продакшн-сборки
- `npm run lint` - Проверка кода с помощью ESLint
- `npm run type-check` - Проверка типов TypeScript

## Переменные окружения

Создайте файл `.env` в корне проекта:

```env
VITE_API_URL=http://localhost:5000/api
```

## Лицензия

MIT
