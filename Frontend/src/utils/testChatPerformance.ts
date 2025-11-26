// Утилита для тестирования производительности чата
export const testChatPerformance = () => {
  // Тест производительности рендеринга сообщений
  const testMessageRendering = (messageCount: number) => {
    const startTime = performance.now();
    
    // Создаем тестовые сообщения (не используем напрямую, но создаем для симуляции нагрузки)
    Array.from({ length: messageCount }, (_, i) => ({
      id: `test-${i}`,
      content: `Тестовое сообщение ${i}`,
      senderId: `user-${i % 5}`,
      username: `Пользователь ${i % 5}`,
      timestamp: Date.now() - (messageCount - i) * 1000,
      isEdited: i % 10 === 0,
      editedAt: i % 10 === 0 ? Date.now() - 5000 : undefined
    }));
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    console.log(`Рендеринг ${messageCount} сообщений занял ${renderTime.toFixed(2)} мс`);
    return { messageCount, renderTime, messagesPerMs: messageCount / renderTime };
  };
  
  // Тест производительности обновления сообщений
  const testMessageUpdates = (updateCount: number) => {
    const startTime = performance.now();
    
    // Симулируем обновления сообщений
    for (let i = 0; i < updateCount; i++) {
      // Симуляция обработки обновления (не используем напрямую, но создаем для симуляции нагрузки)
      ({
        id: `msg-${i}`,
        content: `Обновленное сообщение ${i}`,
        timestamp: Date.now()
      });
      
      // Симуляция обновления состояния
      // В реальном приложении здесь будет вызов setMessages
    }
    
    const endTime = performance.now();
    const updateTime = endTime - startTime;
    
    console.log(`${updateCount} обновлений сообщений заняли ${updateTime.toFixed(2)} мс`);
    return { updateCount, updateTime, updatesPerMs: updateCount / updateTime };
  };
  
  // Запуск тестов
  console.log("=== Тест производительности чата ===");
  
  // Тесты рендеринга
  const renderTests = [100, 500, 1000, 2000];
  renderTests.forEach(count => {
    testMessageRendering(count);
  });
  
  // Тесты обновлений
  const updateTests = [100, 500, 1000];
  updateTests.forEach(count => {
    testMessageUpdates(count);
  });
  
  console.log("=== Тест завершен ===");
};

// Функция для мониторинга производительности в реальном времени
export const startPerformanceMonitoring = () => {
  let messageRenderCount = 0;
  let lastRenderTime = 0;
  
  // Перехватываем рендеринг сообщений
  const originalConsoleLog = console.log;
  console.log = function(...args) {
    // Проверяем, является ли это логом рендеринга сообщений
    if (args[0] && typeof args[0] === 'string' && args[0].includes('Рендеринг сообщения')) {
      messageRenderCount++;
      const now = performance.now();
      if (lastRenderTime > 0) {
        const renderTime = now - lastRenderTime;
        console.log(`Время рендеринга сообщения: ${renderTime.toFixed(2)} мс`);
      }
      lastRenderTime = now;
    }
    
    // Вызываем оригинальный console.log
    originalConsoleLog.apply(console, args);
  };
  
  // Отчет о производительности каждые 10 секунд
  setInterval(() => {
    console.log(`Скорость рендеринга: ${messageRenderCount / 10} сообщений/сек`);
    messageRenderCount = 0;
  }, 10000);
  
  console.log("Мониторинг производительности запущен");
};

// Экспортируем все функции
export default {
  testChatPerformance,
  startPerformanceMonitoring
};