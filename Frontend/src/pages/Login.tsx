import { useState, useContext } from "react";
import { login } from "../api/auth";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";

export default function Login() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("Login must be used within an AuthProvider");
  }
  const { setUser } = context;
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setErrors([]);
    
    try {
      const res = await login(email, password);

      const { user } = res.data.data;

      setUser(user);

      navigate("/app");
    } catch (e: any) {
      console.error(e);
      
      // Обработка ошибок с бэкенда
      if (e.response?.data?.message) {
        setErrors([e.response.data.message]);
      } else {
        setErrors(["Неверные учетные данные"]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full">
        <h2 className="text-2xl font-bold text-center mb-6">Вход</h2>
        
        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            {errors.map((error, index) => (
              <p key={index} className="text-red-300 text-sm">{error}</p>
            ))}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
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
                Вход...
              </div>
            ) : (
              "Войти"
            )}
          </button>
        </form>
        
        <div className="mt-4 text-center text-sm">
          <p className="text-gray-400">
            Нет аккаунта?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-[#00aff4] hover:underline focus:outline-none"
            >
              Зарегистрироваться
            </button>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
