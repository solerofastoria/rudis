// src/api/client.ts
import axios from "axios";

const api = axios.create({
<<<<<<< Updated upstream
  baseURL: "/api", // проксируется на backend через vite.config.ts
  withCredentials: true, // если backend использует cookie
=======
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
>>>>>>> Stashed changes
});

// 🔐 Добавляем токен авторизации (если он есть)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ⚠️ Обработка ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.warn("Неавторизован — сбрасываем токен");
      localStorage.removeItem("token");
      // можно перенаправить на /login, если нужно
    }
    return Promise.reject(error);
  }
);

export default api;

