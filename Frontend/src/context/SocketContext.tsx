import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { io, Socket } from "socket.io-client";
import { AuthContext } from "./AuthContext";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  console.log("Инициализация состояния сокета:", { socket, isConnected });

  const { user } = useContext(AuthContext);
  console.log("Получен пользователь из AuthContext:", user);

  useEffect(() => {
    if (!user) return;

    console.log("Инициализация сокета для пользователя:", user.id);
    // === Вариант 1: через прокси nginx (рекомендуется в Docker) ===
    const newSocket = io("/", {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      withCredentials: true,
      query: { userId: user.id },
    });

    newSocket.on("connect", () => {
      console.log("🟢 Socket connected:", newSocket.id);
      setIsConnected(true);
    });
    
    newSocket.on("connect_error", (error) => {
      console.log("❌ Socket connection error:", error);
      console.log("Error details:", {
        message: error.message,
        stack: error.stack
      });
    });
    
    newSocket.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", reason);
      setIsConnected(false);
    });
    
    // Добавим лог для отладки подключения
    setTimeout(() => {
      console.log("Состояние подключения через 1 секунду:", {
        connected: newSocket.connected,
        id: newSocket.id
      });
    }, 1000);
    
    // Проверим состояние сокета через 3 секунды
    setTimeout(() => {
      console.log("Состояние подключения через 3 секунды:", {
        connected: newSocket.connected,
        id: newSocket.id
      });
    }, 3000);
    
    newSocket.on("connect_error", (error) => {
      console.log("❌ Socket connection error:", error);
    });

    newSocket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("dm:new", (payload) => {
      console.log("📩 DM received:", payload);
    });
    
    newSocket.on("chat:message", (payload) => {
      console.log("💬 Chat message received:", payload);
      console.log("Тип данных:", typeof payload);
      console.log("Содержание сообщения:", payload);
      console.log("Время получения сообщения:", new Date().toISOString());
    });

    console.log("Сокет установлен");
    console.log("Сокет установлен, проверяем его состояние:", {
      connected: newSocket.connected,
      id: newSocket.id
    });
    setSocket(newSocket);

    return () => {
      console.log("Очистка сокета");
      newSocket.off();
      newSocket.close();
    };
  }, [user]);

  return (
    <SocketContext.Provider
      value={{ socket, isConnected }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
};
