import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import useAuth from "../hooks/useAuth";

export interface ChatMessage {
  content: string;
  username: string;
  timestamp: number;
}

export const useChat = () => {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    console.log("Инициализация useChat хука", { socket: !!socket });
    if (!socket) return;

    const handler = (msg: ChatMessage) => {
      console.log("📩 Новое сообщение:", msg);
      console.log("Текущее состояние сообщений перед обновлением:", messages);
      setMessages((prev) => {
        const newMessages = [...prev, msg];
        console.log("Новое состояние сообщений:", newMessages);
        return newMessages;
      });
    };
    
    console.log("Подписка на chat:message");

    socket.on("chat:message", handler);

    return () => {
      console.log("Отписка от chat:message");
      socket.off("chat:message", handler);
    };
  }, [socket]);

  const send = (text: string) => {
    console.log("📤 Отправка сообщения:", text, user?.username);
    if (!user || !socket) {
      console.log("❌ Пользователь или сокет не определен");
      return;
    }
    console.log("Отправка сообщения через сокет:", text, user.username);
    socket.emit("chat:send", {
      content: text,
      username: user.username,
      timestamp: Date.now(),
    });
  };

  return { messages, isConnected, sendMessage: send };
};
