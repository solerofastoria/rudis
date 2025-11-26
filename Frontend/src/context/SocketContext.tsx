import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
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

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Если нет пользователя → отключаем сокет
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    // Если сокет уже существует — не пересоздаём
    if (socketRef.current) return;

    console.log("🔌 Creating socket for user:", user.id);

    const socket = io("/messages", {
      path: "/socket.io",
      transports: ["websocket"],
      query: { userId: String(user.id) }, // важно!
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
    
    console.log("🔌 Socket created:", socket);

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🟢 Socket connected:", socket.id);
      console.log("🔗 Connected to namespace:", socket.connected);
      setIsConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", reason);
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.log("❌ Socket error:", err.message);
    });
    
    // Добавим отладку для всех событий
    socket.onAny((event, ...args) => {
      console.log("📡 Socket event:", event, args);
    });

    return () => {
      console.log("♻ Cleaning socket");
      if (socketRef.current) {
        socketRef.current.removeAllListeners(); // важно!
        socketRef.current.disconnect();
      }
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [user]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
      }}
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
