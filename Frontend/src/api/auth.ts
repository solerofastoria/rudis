import api from "./client";
import type { IAuthResponse } from "../types/auth";

// Регистрация
export const register = async (username: string, email: string, password: string) => {
  return api.post<IAuthResponse>("/auth/register", { username, email, password });
};

// Логин
export const login = async (email: string, password: string) => {
  console.log("API: Attempting login with", email);
  try {
    const response = await api.post<IAuthResponse>("/auth/login", { email, password });
    console.log("API: Login successful", response.data);
    return response;
  } catch (error) {
    console.log("API: Login failed", error);
    throw error;
  }
};

// Проверка пользователя
export const getMe = async () => {
  return api.get<IAuthResponse>("/auth/me");
};

// Обновление профиля
export const updateProfile = async (data: { username?: string; email?: string; status?: string; avatar?: string }) => {
  return api.put<IAuthResponse>("/auth/profile", data);
};

// Выход
export const logout = async () => {
  return api.post("/auth/logout");
};
