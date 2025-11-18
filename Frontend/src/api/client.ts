import axios from "axios";

const api = axios.create({
  baseURL: "/api", // работает через proxy в Docker Nginx
  withCredentials: true, // ОБЯЗАТЕЛЬНО
});
// ⚠️ УДАЛЯЕМ interceptor с localStorage
// Cookie автоматически отправляются браузером
// Поэтому никакие Authorization headers НЕ нужны

// Обработка ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
