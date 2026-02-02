FROM node:18-alpine

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Создаем директорию для загрузок
RUN mkdir -p uploads

# Устанавливаем права доступа
RUN chown -R node:node /app
RUN chmod 755 uploads

# Создаем non-root пользователя
USER node

# Открываем порт
EXPOSE 5000

# Запускаем приложение
CMD ["npm", "start"]
