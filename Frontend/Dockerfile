# --- STAGE 1: Build frontend ---
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build


# --- STAGE 2: Nginx serve ---
FROM nginx:1.27-alpine

COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Важно: теперь стадия называется build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
