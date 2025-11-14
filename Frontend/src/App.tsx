import React, { useState } from "react";
import sun from "./assets/Frame.svg";
import moon from "./assets/Frame-night.svg";
import "./App.css";

function App() {
  const [isLight, setIsLight] = useState(false);
  const [rotate, setRotate] = useState(false);

const toggleTheme = () => {
  setRotate(true);           // включаем вращение
  setIsLight(!isLight);

  setTimeout(() => setRotate(false), 800); // выключение после анимации
};

  return (
    <div className={`app ${isLight ? "light" : "dark"}`}>
      {/* Фоновый размытый слой */}
      <div className="background-layer"></div>

      {/* Кнопка переключения темы */}
      <div className="theme-button" onClick={toggleTheme}>
  <img
    src={isLight ? moon : sun}
    alt="theme-switch"
    className={`sun-icon ${rotate ? "sun-rotate" : ""}`}
  />
</div>

      {/* Форма */}
      <div className="login-box">
        <h1 className="title">Добро пожаловать!</h1>

        <label className="label">Адрес электронной почты или номер телефона *</label>
        <input className="input" placeholder="введите номер" />

        <label className="label">Пароль *</label>
        <input className="input" placeholder="введите пароль" />

        <a className="forgot" href="#">Забыли пароль?</a>

        <button className="login-btn">ВХОД</button>

        <a className="register" href="#">Зарегистрироваться</a>
      </div>
    </div>
  );
}

export default App;
