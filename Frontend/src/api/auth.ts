import axios from "./axios";

// Регистрация
export const register = async (username: string, email: string, password: string) => {
  return axios.post("/auth/register", { username, email, password });
};

// Логин
export const login = async (email: string, password: string) => {
  return axios.post("/auth/login", { email, password });
};

// Проверка пользователя
export const getMe = async () => {
  return axios.get("/auth/me");
};
