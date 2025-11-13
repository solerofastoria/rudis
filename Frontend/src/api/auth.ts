// src/api/auth.ts
import api from "./client";

export async function login(username: string, password: string) {
  const res = await api.post("/auth/login", { username, password });
  const token = res.data?.token;
  if (token) localStorage.setItem("token", token);
  return res.data;
}

export async function register(username: string, password: string) {
  return api.post("/auth/register", { username, password });
}

export async function getCurrentUser() {
  return api.get("/auth/me");
}
