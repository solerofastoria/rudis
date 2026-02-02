import React, { createContext, useState, useEffect, useContext } from "react";
import { login as loginApi, register as registerApi, getMe, logout as logoutApi } from "../api/auth";
import type { IUser } from "../types/auth";

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Попытка получить текущего пользователя
        const response = await getMe();
        setUser(response.data.data.user);
        setLoading(false);
      } catch (error) {
        // Not logged in, which is fine
        setUser(null);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await loginApi(email, password);
      setUser(response.data.data.user);
      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "Ошибка входа";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.join(", ");
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const register = async (email: string, username: string, password: string) => {
    try {
      const response = await registerApi(username, email, password);
      setUser(response.data.data.user);
      return { success: true };
    } catch (error: any) {
      console.error("Registration error:", error);
      let errorMessage = "Ошибка регистрации";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.join(", ");
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const logout = async () => {
    try {
      // Вызываем API logout
      await logoutApi();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Удаляем токен из localStorage (на случай, если он там остался)
      localStorage.removeItem("token");
      // Очищаем состояние пользователя
      setUser(null);
      // Перенаправляем на страницу входа
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Экспортируем контекст для использования в index.ts
export { AuthContext };
