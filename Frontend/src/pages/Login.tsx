import { useState, useContext } from "react";
import { login } from "../api/auth";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await login(email, password);

      const { user, token } = res.data.data;

      localStorage.setItem("token", token);
      setUser(user);

      navigate("/app");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h2>Вход</h2>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Пароль" />
      <button onClick={handleLogin}>Войти</button>
    </div>
  );
}
