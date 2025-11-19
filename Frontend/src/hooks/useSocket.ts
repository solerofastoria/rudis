import { useCallback } from 'react';
import { useSocket as useSocketContext } from '../context/SocketContext';
import type { Socket } from 'socket.io-client';

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (...args: any[]) => void) => (() => void) | undefined;
}

export const useSocket = (): UseSocketReturn => {
  const { socket, isConnected } = useSocketContext();

  const emit = useCallback(
    (event: string, data?: any) => {
      if (isConnected && socket) {
        socket.emit(event, data);
      }
    },
    [socket, isConnected]
  );

  const on = useCallback(
    (event: string, callback: (...args: any[]) => void) => {
      if (socket) {
        socket.on(event, callback);
        return () => {
          socket.off(event, callback);
        };
      }
    },
    [socket]
  );

  return { socket, isConnected, emit, on };
};