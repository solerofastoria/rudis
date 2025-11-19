import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../../hooks/useSocket';
import { useAuth } from '../../../hooks/useAuth';
import type { IMessage, ITypingUser } from '../types';

interface UseChatProps {
  chatId?: string;
}

export const useChat = ({ chatId }: UseChatProps = {}) => {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<ITypingUser[]>([]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (msg: IMessage) => {
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

    socket.on('chat:newMessage', handleMessage);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    return () => {
      socket.off('chat:newMessage', handleMessage);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [socket, user]);

  // Send a message
  const sendMessage = useCallback(
    (content: string) => {
      if (!socket || !user || !isConnected) return;

      const message: IMessage = {
        id: Date.now().toString(),
        content,
        userId: user.id,
        username: user.username,
        timestamp: Date.now(),
        chatId
      };

      socket.emit('chat:send', message);
      setMessages(prev => [...prev, message]);
    },
    [socket, user, isConnected, chatId]
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