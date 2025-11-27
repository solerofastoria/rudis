<<<<<<< Updated upstream
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
=======
import { useState } from "react";
import sun from "./assets/Frame.svg";
import moon from "./assets/Frame-night.svg";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { login, register } from "./api/auth";
import { SocketProvider } from "./context/SocketContext";
import ChatPage from "./pages/Main/ChatPage";
import PrivateRoute from "./components/PrivateRoute";
>>>>>>> Stashed changes

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

<<<<<<< Updated upstream
export default App
=======
export default function App() {
  return (
    <Routes>
  <Route path="/" element={<LoginPage />} />

  <Route element={<PrivateRoute />}>
    <Route path="/app" element={<AppPage />} />
  </Route>
</Routes>
  );

}
>>>>>>> Stashed changes
