import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../../hooks/useSocket';
import { useAuth } from '../../../hooks/useAuth';
import type { IMessage } from '../types';
import * as messageApi from '../../../api/messages';

export const useMessages = (userId?: string) => {
  const { socket, isConnected, emit } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Load messages
  const loadMessages = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let loadedMessages: IMessage[] = [];
      
      if (userId) {
        // Load direct messages
        loadedMessages = await messageApi.getDirectMessages(userId);
      } else {
        // Load public messages
        loadedMessages = await messageApi.getMessages();
      }
      
      // Проверяем, что loadedMessages - это массив
      if (Array.isArray(loadedMessages)) {
        setMessages(loadedMessages);
      } else {
        console.error("❌ loadedMessages не является массивом:", loadedMessages);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }, [user, userId]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) {
      setLoading(false);
      return;
    }

    // Load initial messages
    loadMessages();

    const handleMessage = (msg: IMessage) => {
      console.log("📥 Получено сообщение в useMessages:", msg);
      console.log("Тип сообщения:", typeof msg);
      console.log("Сообщение является массивом:", Array.isArray(msg));
      
      // Проверяем, что msg - это объект, а не массив или другое значение
      if (!msg || typeof msg !== 'object' || Array.isArray(msg)) {
        console.error("❌ Неверный формат сообщения:", msg);
        return;
      }
      
      setMessages(prev => {
        // Убедимся, что prev - это массив
        if (!Array.isArray(prev)) {
          console.error("❌ prev не является массивом:", prev);
          return [msg];
        }
        
        // Проверяем, есть ли уже такое сообщение
        const exists = prev.some(m => m.id === msg.id);
        if (exists) {
          // Если сообщение уже есть, обновляем его
          return prev.map(m => m.id === msg.id ? msg : m);
        }
        // Если сообщения нет, добавляем его
        return [...prev, msg];
      });
    };

    const handleMessageUpdated = (msg: IMessage) => {
      console.log("✏️ Обновление сообщения в useMessages:", msg);
      
      // Проверяем, что msg - это объект
      if (!msg || typeof msg !== 'object' || Array.isArray(msg)) {
        console.error("❌ Неверный формат обновленного сообщения:", msg);
        return;
      }
      
      setMessages(prev => {
        // Убедимся, что prev - это массив
        if (!Array.isArray(prev)) {
          console.error("❌ prev не является массивом:", prev);
          return [];
        }
        
        return prev.map(m => m.id === msg.id ? msg : m);
      });
    };

    const handleMessageDeleted = ({ messageId }: { messageId: string }) => {
      console.log("🗑️ Удаление сообщения в useMessages:", messageId);
      
      setMessages(prev => {
        // Убедимся, что prev - это массив
        if (!Array.isArray(prev)) {
          console.error("❌ prev не является массивом:", prev);
          return [];
        }
        
        return prev.filter(m => m.id !== messageId);
      });
    };

    // Socket event listeners
    socket.on('chat:message', handleMessage);
    socket.on('dm:new', handleMessage);
    socket.on('message:updated', handleMessageUpdated);
    socket.on('message:deleted', handleMessageDeleted);

    return () => {
      socket.off('chat:message', handleMessage);
      socket.off('dm:new', handleMessage);
      socket.off('message:updated', handleMessageUpdated);
      socket.off('message:deleted', handleMessageDeleted);
    };
  }, [socket, loadMessages]);

  // Send a message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!user || !isConnected || !socket) return;

      try {
        // Отправляем сообщение через сокет напрямую
        if (userId) {
          // Send direct message
          emit('dm:send', { toUserId: userId, content });
        } else {
          // Send public message
          emit('chat:send', { content, username: user.username });
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    },
    [user, isConnected, socket, userId, emit]
  );

  // Edit a message
  const editMessage = useCallback(
    async (messageId: string, content: string) => {
      if (!user || !isConnected || !socket) return;

      try {
        // Отправляем через сокет напрямую
        emit('message:edit', { messageId, content });
      } catch (error) {
        console.error('Error editing message:', error);
      }
    },
    [user, isConnected, socket, emit]
  );

  // Delete a message
  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!user || !isConnected || !socket) return;

      try {
        // Отправляем через сокет напрямую
        emit('message:delete', { messageId });
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    },
    [user, isConnected, socket, emit]
  );

  return {
    messages,
    loading,
    isConnected,
    sendMessage,
    editMessage,
    deleteMessage,
    loadMessages
  };
};