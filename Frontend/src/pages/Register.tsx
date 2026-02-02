import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { register } from "../api/auth";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";

export default function Register() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("Register must be used within an AuthProvider");
  }
  const { setUser } = context;
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setErrors([]);
    
    try {
      // ПЕРЕДАЁМ username, email, password
      const res = await register(username, email, password);

      const { user, token } = res.data.data;

      localStorage.setItem("token", token);
      setUser(user);

      navigate("/app");
    } catch (err: any) {
      console.error("Registration error:", err);
      
      // Обработка ошибок с бэкенда
      if (err.response?.data?.message) {
        setErrors([err.response.data.message]);
      } else if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors(["Ошибка регистрации. Попробуйте позже."]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full">
        <h2 className="text-2xl font-bold text-center mb-6">Регистрация</h2>
        
        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            {errors.map((error, index) => (
              <p key={index} className="text-red-300 text-sm">{error}</p>
            ))}
          </div>
        )}
        
        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Имя пользователя</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Введите имя пользователя"
              className="w-full px-4 py-2 bg-[#202225] border border-[#202225] rounded-lg focus:outline-none focus:border-[#5865f2] transition-colors"
              disabled={loading}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите email"
              className="w-full px-4 py-2 bg-[#202225] border border-[#202225] rounded-lg focus:outline-none focus:border-[#5865f2] transition-colors"
              disabled={loading}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Пароль</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Введите пароль"
              className="w-full px-4 py-2 bg-[#202225] border border-[#202225] rounded-lg focus:outline-none focus:border-[#5865f2] transition-colors"
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[#5865f2] hover:bg-[#4752c4] rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Регистрация...
              </div>
            ) : (
              "Зарегистрироваться"
            )}
          </button>
        </form>
        
        <div className="mt-4 text-center text-sm">
          <p className="text-gray-400">
            Уже есть аккаунт?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-[#00aff4] hover:underline focus:outline-none"
            >
              Войти
            </button>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
