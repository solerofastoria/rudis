import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../../hooks/useSocket';
import type { IMessage } from '../types';

export const useMessages = (chatId?: string) => {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Listen for new messages
  useEffect(() => {
    if (!socket) {
      setLoading(false);
      return;
    }

    const handleMessage = (msg: IMessage) => {
      // Filter messages by chatId if provided
      if (!chatId || msg.chatId === chatId) {
        setMessages(prev => [...prev, msg]);
      }
    };

    // Simulate initial load
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);

    socket.on('chat:newMessage', handleMessage);

    return () => {
      socket.off('chat:newMessage', handleMessage);
    };
  }, [socket, chatId]);

  // Send a message
  const sendMessage = useCallback(
    (content: string, userId: number, username: string) => {
      if (!socket || !isConnected) return;

      const message: IMessage = {
        id: Date.now().toString(),
        content,
        userId,
        username,
        timestamp: Date.now(),
        chatId
      };

      socket.emit('chat:send', message);
    },
    [socket, isConnected, chatId]
  );

  // Load messages (simulated)
  const loadMessages = useCallback(() => {
    setLoading(true);
    // In a real app, this would fetch from an API
    setTimeout(() => {
      setLoading(false);
    }, 300);
  }, []);

  return {
    messages,
    loading,
    isConnected,
    sendMessage,
    loadMessages
  };
};