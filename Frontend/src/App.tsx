import { useState } from "react";
import sun from "./assets/Frame.svg";
import moon from "./assets/Frame-night.svg";
import "./App.css";
import axios from "axios";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [isLight, setIsLight] = useState(false);
  const [rotate, setRotate] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const api = axios.create({
    baseURL: "http://localhost:5000/api",
  });

  const navigate = useNavigate();

  const toggleTheme = () => {
    setRotate(true);
    setIsLight(!isLight);
    setTimeout(() => setRotate(false), 800);
  };

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token } = res.data.data;

      localStorage.setItem("token", token);

      navigate("/app");
    } catch (err) {
      alert("Ошибка входа");
    }
  };

  const handleRegister = async () => {
    try {
      const username = email.split("@")[0];

      const res = await api.post("/auth/register", { email, password, username });
      const { token } = res.data.data;

      localStorage.setItem("token", token);

      navigate("/app");
    } catch (err) {
      alert("Ошибка регистрации");
    }
  };

  return (
    <div className={`app ${isLight ? "light" : "dark"}`}>
      <div className="background-layer"></div>

      <div className="theme-button" onClick={toggleTheme}>
        <img
          src={isLight ? moon : sun}
          alt="theme-switch"
          className={`sun-icon ${rotate ? "sun-rotate" : ""}`}
        />
      </div>

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
    </div>
  );
}

function AppPage() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>🎉 Добро пожаловать в приложение!</h1>
      <p>Вы успешно вошли.</p>

      <button
        onClick={logout}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          fontSize: "18px",
          cursor: "pointer",
        }}
      >
        Выйти
      </button>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/app" element={<AppPage />} />
      </Routes>
    </BrowserRouter>
  );
}