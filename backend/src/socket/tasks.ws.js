// backend/src/socket/tasks.ws.js
const WebSocket = require('ws');

let wss = null;
let wsClients = [];

function initTaskWS(server, aiAgentRouter) {
  console.log('🔌 Инициализация WebSocket для задач...');
  
  wss = new WebSocket.Server({ 
    server, 
    path: '/ws/tasks'
  });

  wss.on('connection', (ws) => {
    wsClients.push(ws);
    console.log('⚡ WebSocket клиент подключился. Всего:', wsClients.length);

    ws.send(JSON.stringify({
      type: 'connected',
      message: 'WebSocket подключен',
      timestamp: new Date().toISOString()
    }));

    ws.on('close', () => {
      wsClients = wsClients.filter(client => client !== ws);
      console.log('⚡ WebSocket клиент отключился. Осталось:', wsClients.length);
    });
  });

  if (aiAgentRouter && aiAgentRouter.setWsBroadcast) {
    aiAgentRouter.setWsBroadcast(broadcastTaskUpdate);
    console.log('✅ WebSocket broadcast настроен');
  }

  console.log('✅ WebSocket сервер запущен на /ws/tasks');
}

function broadcastTaskUpdate(task) {
  if (!task) return;

  const message = JSON.stringify({
    type: 'task_update',
    task,
    timestamp: new Date().toISOString()
  });

  wsClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

module.exports = { initTaskWS, broadcastTaskUpdate };