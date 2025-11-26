import api from "./client";

// Регистрация
export const register = async (username: string, email: string, password: string) => {
  return api.post("/auth/register", { username, email, password });
};

// Логин
export const login = async (email: string, password: string) => {
  console.log("API: Attempting login with", email);
  try {
    const response = await api.post("/auth/login", { email, password });
    console.log("API: Login successful", response.data);
    return response;
  } catch (error) {
    console.log("API: Login failed", error);
    throw error;
  }
};

// Проверка пользователя
export const getMe = async () => {
  return api.get("/auth/me");
};
