import { useEffect } from "react";
import "./App.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import useAuth from "./hooks/useAuth";
import { MainLayout } from "./components/MainLayout";
import { ChatPerformanceStats } from "./components/ChatPerformanceStats";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";

function AppPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // 1. Пока не загрузился AuthContext → показываем загрузку
  if (authLoading) {
    return <div className="loading">Загрузка...</div>;
  }

  useEffect(() => {
    // 2. Если нет пользователя → редирект
    if (!user) {
      navigate("/");
      return;
    }

    // 3. Если просто /app → переходим в /app/chat
    if (window.location.pathname === "/app") {
      navigate("/app/chat");
    }
  }, [user, navigate]);

  return (
    <div style={{ height: "100vh" }}>
      <MainLayout />
      {/* Статистика производительности */}
      <ChatPerformanceStats />
    </div>
  );
}

/* ========================= ROUTER ========================= */

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <div>Загрузка...</div>;

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/"
        element={user ? <AppPage /> : <LoginPage />}
      />

      <Route
        path="/app/*"
        element={user ? <AppPage /> : <LoginPage />}
      />

      <Route
        path="/app/chat"
        element={user ? <MainLayout /> : <LoginPage />}
      />

      <Route
        path="/dm/:userId"
        element={user ? <MainLayout /> : <LoginPage />}
      />
      
      <Route
        path="/app/friends"
        element={user ? <MainLayout /> : <LoginPage />}
      />
      
      <Route
        path="/app/servers/:serverId"
        element={user ? <MainLayout /> : <LoginPage />}
      />
    </Routes>
  );
}
