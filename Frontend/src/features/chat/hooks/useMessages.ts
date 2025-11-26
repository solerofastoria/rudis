import { useState, useEffect, useCallback } from "react";
import { useSocket } from "../../../context/SocketContext"; // ← ОСТАЁТСЯ ТОЛЬКО ЭТО
import { useAuth } from "../../../hooks/useAuth";
import type { IMessage } from "../types/types";
import * as messageApi from "../../../api/messages";

export const useMessages = (userId?: string) => {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Проверяем — это сообщение относится к текущему чату?
  const isForThisChat = useCallback(
    (msg: IMessage) => {
      if (!user) return false;
      
      console.log("🔍 Проверка сообщения для чата:", { msg, userId, currentUserId: user.id });

      // Личные сообщения
      if (userId) {
        const isMatch = (
          (msg.senderId === user.id && msg.recipientId === userId) ||
          (msg.senderId === userId && msg.recipientId === user.id)
        );
        console.log("🔍 Личное сообщение подходит:", isMatch);
        return isMatch;
      }

      // Общий чат
      const isPublic = !msg.recipientId;
      console.log("🔍 Общее сообщение подходит:", isPublic);
      return isPublic;
    },
    [user, userId]
  );

  // Загрузка сообщений с сервера
  const loadMessages = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      let loaded: IMessage[] = [];

      loaded = userId
        ? await messageApi.getDirectMessages(userId)
        : await messageApi.getMessages();

      setMessages(
        (loaded ?? []).sort((a, b) => {
          const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return da - db;
        })
      );
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  }, [user, userId]);

  // Работа с сокетом
  useEffect(() => {
    if (!socket) {
      setLoading(false);
      return;
    }

    loadMessages();
    
    console.log("📡 Подписка на события сокета");

    // Новое сообщение
    const handleMessage = (msg: any) => {
      console.log("📥 Получено новое сообщение:", msg);
      
      // Преобразуем формат сообщения от сервера к формату фронтенда
      const formattedMsg: IMessage = {
        id: msg.id,
        content: msg.content,
        senderId: msg.senderId || msg.userId, // сервер может отправлять userId вместо senderId
        recipientId: msg.recipientId,
        username: msg.username || (msg.sender?.username),
        timestamp: msg.timestamp || new Date(msg.createdAt).getTime(),
        isEdited: msg.isEdited,
        editedAt: msg.editedAt ? new Date(msg.editedAt).getTime() : undefined,
        isDirect: msg.isDirect,
        isRead: msg.isRead,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt
      };

      console.log("📥 Обработанное сообщение:", formattedMsg);
      if (!isForThisChat(formattedMsg)) {
        console.log("🚫 Сообщение не для этого чата:", formattedMsg);
        return;
      }

      setMessages((prev) => {
        const exists = prev.some((m) => m.id === formattedMsg.id);
        if (exists) {
          console.log("🔄 Сообщение уже существует:", formattedMsg.id);
          return prev;
        }

        const next = [...prev, formattedMsg];
        next.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        console.log("💬 Обновлен список сообщений:", next);
        console.log("💬 Длина нового списка:", next.length);
        return next;
      });
    };

    // Обновление
    const handleUpdated = (msg: any) => {
      // Преобразуем формат сообщения от сервера к формату фронтенда
      const formattedMsg: IMessage = {
        id: msg.id,
        content: msg.content,
        senderId: msg.senderId || msg.userId,
        recipientId: msg.recipientId,
        username: msg.username || (msg.sender?.username),
        timestamp: msg.timestamp || new Date(msg.createdAt).getTime(),
        isEdited: msg.isEdited,
        editedAt: msg.editedAt ? new Date(msg.editedAt).getTime() : undefined,
        isDirect: msg.isDirect,
        isRead: msg.isRead,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt
      };

      if (!isForThisChat(formattedMsg)) return;
      setMessages((prev) => prev.map((m) => (m.id === formattedMsg.id ? formattedMsg : m)));
    };

    // Удаление
    const handleDeleted = ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    };

    socket.on("dm:new", handleMessage);
    socket.on("dm:sent", handleMessage);
    socket.on("chat:message", handleMessage);
    socket.on("message:updated", handleUpdated);
    socket.on("message:deleted", handleDeleted);
    
    // Обработка ошибок
    socket.on("dm:error", (error) => {
      console.error("❌ Ошибка DM:", error);
    });
    
    socket.on("chat:error", (error) => {
      console.error("❌ Ошибка чата:", error);
    });
    
    socket.on("message:error", (error) => {
      console.error("❌ Ошибка сообщения:", error);
    });
    
    console.log("📡 Подписка на события завершена");

    return () => {
      socket.off("dm:new", handleMessage);
      socket.off("dm:sent", handleMessage);
      socket.off("chat:message", handleMessage);
      socket.off("message:updated", handleUpdated);
      socket.off("message:deleted", handleDeleted);
    };
  }, [socket, loadMessages, isForThisChat]);

  // Отправка сообщения
  const sendMessage = useCallback(
    (content: string) => {
      if (!user || !isConnected || !socket) return;
      
      console.log("📤 Отправка сообщения:", { content, userId, isConnected });

      if (userId) {
        console.log("📤 Отправка DM:", { toUserId: userId, content });
        socket.emit("dm:send", { toUserId: userId, content });
      } else {
        console.log("📤 Отправка в чат:", { content, username: user.username });
        socket.emit("chat:send", { content, username: user.username });
      }
    },
    [user, isConnected, socket, userId]
  );

  const editMessage = useCallback(
    (messageId: string, content: string) => {
      if (!user || !isConnected || !socket) return;
      socket.emit("message:edit", { messageId, content });
    },
    [user, isConnected, socket]
  );

  const deleteMessage = useCallback(
    (messageId: string) => {
      if (!user || !isConnected || !socket) return;
      socket.emit("message:delete", { messageId });
    },
    [user, isConnected, socket]
  );

  return {
    messages,
    loading,
    isConnected,
    sendMessage,
    editMessage,
    deleteMessage,
    loadMessages,
  };
};
