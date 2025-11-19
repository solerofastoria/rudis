import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../../hooks/useSocket';
import { useAuth } from '../../../hooks/useAuth';
import type { ITypingUser } from '../types';

export const useTyping = (chatId?: string) => {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<ITypingUser[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Listen for typing events
  useEffect(() => {
    if (!socket || !user) return;

    const handleTypingStart = (data: { userId: number }) => {
      if (data.userId !== user.id) {
        setTypingUsers(prev => {
          const existingUser = prev.find(u => u.userId === data.userId);
          if (!existingUser) {
            return [...prev, { userId: data.userId, username: `User ${data.userId}` }];
          }
          return prev;
        });
      }
    };

    const handleTypingStop = (data: { userId: number }) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    };

    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    return () => {
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [socket, user]);

  // Start typing indicator
  const startTyping = useCallback(() => {
    if (!socket || !chatId || !user || !isConnected || isTyping) return;
    
    socket.emit('typing:start', { chatId });
    setIsTyping(true);
  }, [socket, chatId, user, isConnected, isTyping]);

  // Stop typing indicator
  const stopTyping = useCallback(() => {
    if (!socket || !chatId || !user || !isConnected || !isTyping) return;
    
    socket.emit('typing:stop', { chatId });
    setIsTyping(false);
  }, [socket, chatId, user, isConnected, isTyping]);

  // Auto stop typing after delay
  const autoStopTyping = useCallback((delay: number = 1000) => {
    if (!isTyping) return;
    
    const timer = setTimeout(() => {
      stopTyping();
    }, delay);
    
    return () => clearTimeout(timer);
  }, [isTyping, stopTyping]);

  return {
    typingUsers,
    isTyping,
    startTyping,
    stopTyping,
    autoStopTyping
  };
};