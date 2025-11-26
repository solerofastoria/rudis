import { useState, useContext, useEffect } from "react";
import sun from "./assets/Frame.svg";
import moon from "./assets/Frame-night.svg";

// Фоны
import bgDark from "./assets/bg.jpg";
import bgLight from "./assets/bg-sun.jpg";

import "./App.css";

import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { login, register } from "./api/auth";
import { ChatLayout } from "./pages/Main";
import { AuthContext } from "./context/AuthContext";
import { ChatPerformanceStats } from "./components/ChatPerformanceStats";

function LoginPage() {
  const { setUser } = useContext(AuthContext);

  const [isLight, setIsLight] = useState(false);
  const [rotate, setRotate] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  /** Переключение темы */
  const toggleTheme = () => {
    setRotate(true);
    setIsLight((prev) => !prev);
    setTimeout(() => setRotate(false), 800);
  };

  /** Логин */
  const handleLogin = async () => {
    try {
      const res = await login(email, password);
      setUser(res.data.data.user);

      setTimeout(() => navigate("/app"), 100);
    } catch (err) {
      alert("Ошибка входа");
    }
  };

  /** Регистрация */
  const handleRegister = async () => {
    try {
      const username = email.split("@")[0];
      const res = await register(username, email, password);
      setUser(res.data.data.user);

      setTimeout(() => navigate("/app"), 100);
    } catch (err) {
      alert("Ошибка регистрации");
    }
  };

  return (
    <div
      className={`app ${isLight ? "light" : "dark"}`}
      style={
        {
          "--bg-image": `url(${isLight ? bgLight : bgDark})`
        } as React.CSSProperties
      }
    >
      {/* Размытый слой */}
      <div className="background-layer"></div>

      {/* Кнопка переключения темы */}
      <div className="theme-button" onClick={toggleTheme}>
        <img
          src={isLight ? moon : sun}
          alt="theme-switch"
          className={`sun-icon ${rotate ? "sun-rotate" : ""}`}
        />
      </div>

      {/* Форма входа */}
      <div className="login-box">
        <h1 className="title">Добро пожаловать!</h1>

        <label className="label">Email *</label>
        <input
          className="input"
          placeholder="введите email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="label">Пароль *</label>
        <input
          className="input"
          type="password"
          placeholder="введите пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="login-btn" onClick={handleLogin}>
          ВХОД
        </button>

        <a className="register" href="#" onClick={handleRegister}>
          Зарегистрироваться
        </a>
      </div>
      
      {/* Статистика производительности */}
      <ChatPerformanceStats />
    </div>
  );
}

/* ========================= APP PAGE ========================= */

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
      <ChatLayout />
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
      <Route path="/" element={<LoginPage />} />

      <Route
        path="/app/*"
        element={user ? <AppPage /> : <LoginPage />}
      />

      <Route
        path="/app/chat"
        element={user ? <ChatLayout /> : <LoginPage />}
      />

      <Route
        path="/dm/:userId"
        element={user ? <ChatLayout /> : <LoginPage />}
      />
    </Routes>
  );
}
