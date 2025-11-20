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
      console.log("Отправка события:", event, data);
      if (isConnected && socket) {
        socket.emit(event, data);
      } else {
        console.log("Невозможно отправить событие, сокет не подключен:", { isConnected, socket: !!socket });
      }
    },
    [socket, isConnected]
  );

  const on = useCallback(
    (event: string, callback: (...args: any[]) => void) => {
      console.log("Подписка на событие:", event);
      if (socket) {
        socket.on(event, callback);
        return () => {
          console.log("Отписка от события:", event);
          socket.off(event, callback);
        };
      }
    },
    [socket]
  );

  return { socket, isConnected, emit, on };
};