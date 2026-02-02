import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button/Button";
import { Input } from "../../components/ui/Input/Input";
import { Card } from "../../components/ui/Card/Card";
import "./Auth.css";

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // Валидация формы
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    // Проверка имени пользователя
    if (!username.trim()) {
      newErrors.username = "Имя пользователя обязательно";
    } else if (username.length < 3) {
      newErrors.username = "Имя пользователя должно содержать минимум 3 символа";
    } else if (username.length > 30) {
      newErrors.username = "Имя пользователя не должно превышать 30 символов";
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = "Имя пользователя может содержать только буквы, цифры и подчеркивания";
    }
    
    // Проверка email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = "Email обязателен";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Неверный формат email";
    }
    
    // Проверка пароля
    if (!password) {
      newErrors.password = "Пароль обязателен";
    } else if (password.length < 6) {
      newErrors.password = "Пароль должен содержать минимум 6 символов";
    } else if (password.length > 128) {
      newErrors.password = "Пароль не должен превышать 128 символов";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = "Пароль должен содержать заглавные и строчные буквы, а также цифры";
    }
    
    // Проверка подтверждения пароля
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const result = await register(email, username, password);
      
      if (result.success) {
        navigate("/app");
      } else {
        // Обработка ошибок с бэкенда
        if (result.error?.includes("email")) {
          setErrors({ email: result.error });
        } else if (result.error?.includes("имя")) {
          setErrors({ username: result.error });
        } else {
          setError(result.error || "Ошибка регистрации");
        }
      }
    } catch (err) {
      setError("Произошла ошибка при регистрации. Пожалуйста, попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Добро пожаловать!</h2>
          <p className="auth-subtitle">Создайте аккаунт для начала работы</p>
        </div>
        
        {error && (
          <div className="error-message">
            <svg className="error-icon" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <Input
              type="text"
              label="Имя пользователя"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={errors.username}
              placeholder="Введите имя пользователя"
              fullWidth
            />
          </div>
          
          <div className="form-group">
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              placeholder="your@email.com"
              fullWidth
            />
          </div>
          
          <div className="form-group">
            <Input
              type="password"
              label="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              placeholder="••••••••"
              fullWidth
            />
          </div>
          
          <div className="form-group">
            <Input
              type="password"
              label="Подтверждение пароля"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              placeholder="••••••••"
              fullWidth
            />
          </div>
          
          <Button
            type="submit"
            loading={loading}
            fullWidth
          >
            Зарегистрироваться
          </Button>
        </form>
        
        <div className="auth-link">
          Уже есть аккаунт?{" "}
          <Link to="/login">Войдите</Link>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;