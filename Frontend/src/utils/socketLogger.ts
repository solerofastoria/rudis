// Утилита для логирования сокетов с троттлингом
const LOG_THROTTLE_TIME = 1000; // 1 секунда
const logTimestamps: Record<string, number> = {};

export const throttledSocketLog = (event: string, data?: any) => {
  const now = Date.now();
  const lastLogTime = logTimestamps[event] || 0;
  
  if (now - lastLogTime > LOG_THROTTLE_TIME) {
    console.log(`[Socket] ${event}:`, data);
    logTimestamps[event] = now;
  }
};

// Очистка старых записей (опционально)
export const cleanupLogTimestamps = () => {
  const now = Date.now();
  Object.keys(logTimestamps).forEach(key => {
    if (now - logTimestamps[key] > 60000) { // 1 минута
      delete logTimestamps[key];
    }
  });
};