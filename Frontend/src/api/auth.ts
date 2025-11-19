import api from "./client";

// Регистрация
export const register = async (username: string, email: string, password: string) => {
  return api.post("/auth/register", { username, email, password });
};

// Логин
export const login = async (email: string, password: string) => {
  return api.post("/auth/login", { email, password });
};

// Проверка пользователя
export const getMe = async () => {
  return api.get("/auth/me");
};
