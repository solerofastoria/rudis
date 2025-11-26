import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../../../hooks/useSocket';
import { useAuth } from '../../../hooks/useAuth';
import type { IMessage, ITypingUser } from '../types/types';
import { throttle } from '../../../utils/throttle';

interface UseChatProps {
  chatId?: string;
}

export const useChat = ({ chatId }: UseChatProps = {}) => {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<ITypingUser[]>([]);
  
  // Троттлинг для обновлений сообщений (не чаще 1 раза в 100 мс)
  const throttledSetMessages = useRef(
    throttle((newMessages: IMessage[]) => {
      setMessages(newMessages);
    }, 100)
  ).current;

  // Listen for new messages
  useEffect(() => {
    console.log("Инициализация useChat хука", { socket: !!socket, user: !!user });
    if (!socket) return;

    const handleMessage = (msg: IMessage) => {
      console.log("📥 Получено новое сообщение:", msg);
      // Используем троттлинг для обновления сообщений
      throttledSetMessages([...messages, msg]);
    };

    const handleTypingStart = (data: { userId: string }) => {
      if (user && data.userId !== user.id) {
        setTypingUsers(prev => {
          const newUser = { userId: data.userId, username: `User ${data.userId}` };
          return [...prev, newUser];
        });
      }
    };

    const handleTypingStop = (data: { userId: string }) => {
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
  }, [socket, user, messages, throttledSetMessages]);

  const sendMessage = useCallback((content: string) => {
    if (!socket || !user) return;
    
    console.log("📤 Отправка сообщения:", { content, chatId });
    
    if (chatId) {
      // Личное сообщение
      socket.emit('dm:send', { toUserId: chatId, content });
    } else {
      // Общее сообщение
      socket.emit('chat:send', { content });
    }
  }, [socket, user, chatId]);

  const sendTypingStart = useCallback(() => {
    if (!socket || !user || !chatId) return;
    socket.emit('typing:start', { chatId });
  }, [socket, user, chatId]);

  const sendTypingStop = useCallback(() => {
    if (!socket || !user || !chatId) return;
    socket.emit('typing:stop', { chatId });
  }, [socket, user, chatId]);

  return {
    messages,
    typingUsers,
    isConnected,
    sendMessage,
    sendTypingStart,
    sendTypingStop
  };
};