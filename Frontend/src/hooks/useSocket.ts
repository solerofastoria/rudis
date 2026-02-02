import { useCallback } from 'react';
import { useSocket as useSocketContext } from '../context/SocketContext';
import { throttledSocketLog } from '../utils/socketLogger';

interface UseSocketReturn {
  socket: any | null;
  isConnected: boolean;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (...args: any[]) => void) => (() => void) | undefined;
}

export const useSocket = (): UseSocketReturn => {
  const { socket, isConnected } = useSocketContext();

  const emit = useCallback(
    (event: string, data?: any) => {
      throttledSocketLog("Отправка события", { event, data });
      if (isConnected && socket) {
        socket.emit(event, data);
      } else {
        throttledSocketLog("Невозможно отправить событие, сокет не подключен", { isConnected, socket: !!socket });
      }
    },
    [socket, isConnected]
  );

  const on = useCallback(
    (event: string, callback: (...args: any[]) => void) => {
      throttledSocketLog("Подписка на событие", event);
      if (socket) {
        socket.on(event, callback);
        return () => {
          throttledSocketLog("Отписка от события", event);
          socket.off(event, callback);
        };
      }
    },
    [socket]
  );

  return { socket, isConnected, emit, on };
};