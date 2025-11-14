import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { register } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      // ПЕРЕДАЁМ username, email, password
      const res = await register(username, email, password);

      const { user, token } = res.data.data;

      localStorage.setItem("token", token);
      setUser(user);

      navigate("/app");
    } catch (err) {
      console.error("Registration error:", err);
    }
  };

  return (
    <div>
      <h2>Регистрация</h2>

      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="Пароль"
      />

      <button onClick={handleRegister}>Зарегистрироваться</button>
    </div>
  );
}
