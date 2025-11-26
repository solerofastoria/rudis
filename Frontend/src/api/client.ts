import axios from "axios";

// В режиме разработки Vite проксирует /api к бэкенду
// В production (Docker) nginx проксирует /api к бэкенду
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export default api;
