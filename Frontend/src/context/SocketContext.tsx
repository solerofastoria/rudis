import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { AuthContext } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = React.useContext(AuthContext);

  useEffect(() => {
  if (user) {
    const newSocket = io('http://localhost:5000', {
      withCredentials: true,
      query: {
        userId: user.id
      },
      transports: ['websocket'] // только websocket
    });

    newSocket.on('connect', () => {
      console.log('🟢 Socket connected', newSocket.id);
      setIsConnected(true);

      newSocket.emit('authenticate', { userId: user.id });
    });

    newSocket.on('disconnect', () => {
      console.log('🔴 Socket disconnected');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }
}, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};