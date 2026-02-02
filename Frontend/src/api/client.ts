import axios from "axios";

// В режиме разработки Vite проксирует /api к бэкенду
// В production (Docker) nginx проксирует /api к бэкенду
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Добавляем токен к каждому запросу, если он есть
api.interceptors.request.use(
  (config) => {
    // Удаляем установку Authorization header, так как мы используем cookies
    // Токен будет автоматически отправляться в cookies
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Обрабатываем ошибки авторизации
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Перенаправляем на страницу входа
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
