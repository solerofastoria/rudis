// backend/src/socket/tasks.ws.js
// WebSocket для real-time обновлений задач

const WebSocket = require('ws');

let wss = null;
let wsClients = [];

/**
 * Инициализация WebSocket сервера
 */
function initTaskWS(server, aiAgentRouter) {
  console.log('🔌 Инициализация WebSocket для задач...');
  
  wss = new WebSocket.Server({ 
    server, 
    path: '/ws/tasks',
    verifyClient: (info) => {
      // Можно добавить проверку авторизации
      return true;
    }
  });

  wss.on('connection', (ws, req) => {
    wsClients.push(ws);
    console.log('⚡ WebSocket клиент подключился. Всего клиентов:', wsClients.length);

    // Отправляем приветственное сообщение
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'WebSocket подключен',
      timestamp: new Date().toISOString()
    }));

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        handleClientMessage(ws, data);
      } catch (error) {
        console.error('Ошибка обработки сообщения:', error);
      }
    });

    ws.on('close', () => {
      wsClients = wsClients.filter(client => client !== ws);
      console.log('⚡ WebSocket клиент отключился. Осталось клиентов:', wsClients.length);
    });

    ws.on('error', (error) => {
      console.error('WebSocket ошибка:', error);
    });

    // Пинг каждые 30 секунд для поддержания соединения
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      } else {
        clearInterval(pingInterval);
      }
    }, 30000);
  });

  // Инжектим функцию broadcast в ai-agent.routes
  if (aiAgentRouter && aiAgentRouter.setWsBroadcast) {
    aiAgentRouter.setWsBroadcast(broadcastTaskUpdate);
    console.log('✅ WebSocket broadcast инжектирован в AI агента');
  }

  console.log('✅ WebSocket сервер запущен на /ws/tasks');
}

/**
 * Обработка сообщений от клиента
 */
function handleClientMessage(ws, data) {
  console.log('📨 Получено сообщение от клиента:', data.type);
  
  switch (data.type) {
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
      break;
      
    case 'get_tasks':
      // Можно отправить текущие задачи
      // const tasks = require('../routes/ai-agent.routes').tasks;
      // ws.send(JSON.stringify({ type: 'tasks', tasks }));
      break;
      
    default:
      console.log('Неизвестный тип сообщения:', data.type);
  }
}

/**
 * Отправка обновления задачи всем клиентам
 */
function broadcastTaskUpdate(task) {
  if (!task) return;

  const message = JSON.stringify({
    type: 'task_update',
    task,
    timestamp: new Date().toISOString()
  });

  let sentCount = 0;
  wsClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
        sentCount++;
      } catch (error) {
        console.error('Ошибка отправки клиенту:', error);
      }
    }
  });

  if (sentCount > 0) {
    console.log(`📡 Обновление задачи #${task.id} отправлено ${sentCount} клиентам`);
  }
}

/**
 * Broadcast сообщения всем клиентам
 */
function broadcastMessage(type, data) {
  const message = JSON.stringify({
    type,
    data,
    timestamp: new Date().toISOString()
  });

  wsClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

/**
 * Отправка уведомления
 */
function sendNotification(title, message, level = 'info') {
  broadcastMessage('notification', {
    title,
    message,
    level // info, success, warning, error
  });
}

/**
 * Получение количества подключенных клиентов
 */
function getClientsCount() {
  return wsClients.filter(c => c.readyState === WebSocket.OPEN).length;
}

/**
 * Закрытие всех соединений
 */
function closeAll() {
  wsClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.close();
    }
  });
  wsClients = [];
  
  if (wss) {
    wss.close();
  }
  
  console.log('🔌 WebSocket сервер остановлен');
}

module.exports = {
  initTaskWS,
  broadcastTaskUpdate,
  broadcastMessage,
  sendNotification,
  getClientsCount,
  closeAll
};