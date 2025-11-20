import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../../hooks/useSocket';
import { useAuth } from '../../../hooks/useAuth';
import type { IMessage, ITypingUser } from '../types';

interface UseChatProps {
  chatId?: string;
}

export const useChat = ({ chatId }: UseChatProps = {}) => {
  const { socket, isConnected, emit } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<ITypingUser[]>([]);

  // Listen for new messages
  useEffect(() => {
    console.log("Инициализация useChat хука", { socket: !!socket, user: !!user });
    if (!socket) return;

    const handleMessage = (msg: IMessage) => {
      console.log("📥 Получено новое сообщение:", msg);
      setMessages(prev => [...prev, msg]);
    };

    const handleTypingStart = (data: { userId: number }) => {
      if (user && data.userId !== user.id) {
        setTypingUsers(prev => {
          const newUser = { userId: data.userId, username: `User ${data.userId}` };
          return [...prev, newUser];
        });
      }
    };

    const handleTypingStop = (data: { userId: number }) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    };

    console.log("Подписка на события чата");
    socket.on('chat:message', handleMessage);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    return () => {
      console.log("Отписка от событий чата");
      socket.off('chat:message', handleMessage);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [socket, user]);

  // Send a message
  const sendMessage = useCallback(
    (content: string) => {
      console.log("Проверка условий отправки сообщения:", { socket: !!socket, user: !!user, isConnected });
      if (!socket || !user || !isConnected) {
        console.log("❌ Отправка сообщения заблокирована из-за отсутствия необходимых условий");
        return;
      }

      console.log("📤 Отправка сообщения через сокет:", { content, username: user.username });
      emit('chat:send', {
        content,
        username: user.username,
        timestamp: Date.now(),
      });
      // Добавляем сообщение в локальное состояние сразу для быстрого отображения
      const message: IMessage = {
        id: Date.now().toString(),
        content,
        userId: user.id,
        username: user.username,
        timestamp: Date.now(),
        chatId
      };
      setMessages(prev => [...prev, message]);
    },
    [socket, user, isConnected, chatId, emit]
  );

  // Start typing indicator
  const startTyping = useCallback(() => {
    if (!socket || !chatId || !user || !isConnected) return;
    
    socket.emit('typing:start', { chatId });
  }, [socket, chatId, user, isConnected]);

  // Stop typing indicator
  const stopTyping = useCallback(() => {
    if (!socket || !chatId || !user || !isConnected) return;
    
    socket.emit('typing:stop', { chatId });
  }, [socket, chatId, user, isConnected]);

  return {
    messages,
    typingUsers,
    isConnected,
    sendMessage,
    startTyping,
    stopTyping
  };
};