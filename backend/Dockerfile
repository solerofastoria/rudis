FROM node:18

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Устанавливаем переменную окружения для Docker
ENV COOKIE_SECURE=true

# Важно: миграции должны работать в контейнере
RUN npx sequelize-cli db:migrate || true

CMD ["sh", "-c", "npx sequelize-cli db:migrate && npm start"]
