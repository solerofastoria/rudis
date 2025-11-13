// src/pages/Login.tsx
import { useState } from "react";
import { login } from "../api/auth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      window.location.href = "/";
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка авторизации");
    }
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <h1 className="text-2xl font-bold mb-4">Вход в Sputnik Voice</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-3 w-64">
        <input
          className="border rounded p-2"
          placeholder="Логин"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="border rounded p-2"
          placeholder="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700"
          type="submit"
        >
          Войти
        </button>
      </form>
    </div>
  );
}
