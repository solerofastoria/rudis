// backend/src/routes/chat.routes.js
// HTML интерфейс с WebSocket для real-time обновлений

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AI Project Manager - Live</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Inter',sans-serif;background:#0a0e27;color:#f3f4f6;overflow-x:hidden;}
:root{
  --bg-card:#12172e; --bg-hover:#1a2137; --accent-blue:#3b82f6;
  --accent-green:#10b981; --accent-red:#ef4444; --accent-orange:#f59e0b;
  --text-secondary:#9ca3af; --border:#1f2937;
}
.container{max-width:1400px;margin:0 auto;padding:20px;}
.header{display:flex;justify-content:space-between;align-items:center;padding:20px 30px;background:var(--bg-card);border-radius:16px;margin-bottom:20px;border:1px solid var(--border);}
.logo{font-size:28px;font-weight:700;}
.status-indicator{display:flex;align-items:center;gap:8px;font-size:14px;color:var(--text-secondary);}
.status-dot{width:10px;height:10px;border-radius:50%;animation:pulse 2s ease-in-out infinite;}
.status-dot.connected{background:var(--accent-green);}
.status-dot.disconnected{background:var(--accent-red);}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.5;}}

.prompt-container{margin-bottom:20px;background:var(--bg-card);padding:20px;border-radius:12px;border:1px solid var(--border);}
.prompt-header{font-size:18px;font-weight:600;margin-bottom:15px;}
.prompt-form{display:flex;flex-direction:column;gap:12px;}
.prompt-input{padding:12px;border-radius:8px;border:1px solid var(--border);background:var(--bg-hover);color:white;font-size:14px;}
.prompt-textarea{min-height:100px;resize:vertical;font-family:inherit;}
.prompt-options{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;}
.prompt-select{padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--bg-hover);color:white;font-size:14px;}
.btn-create{padding:12px 24px;border:none;border-radius:8px;background:linear-gradient(135deg,var(--accent-blue),#8b5cf6);color:white;font-size:16px;font-weight:600;cursor:pointer;transition:all 0.2s;}
.btn-create:hover{transform:translateY(-2px);box-shadow:0 8px 16px rgba(59,130,246,0.3);}
.btn-create:disabled{opacity:0.5;cursor:not-allowed;}

.tabs{display:flex;gap:4px;background:var(--bg-card);padding:6px;border-radius:12px;margin-bottom:20px;}
.tab{padding:10px 20px;border:none;background:transparent;color:var(--text-secondary);font-size:14px;font-weight:500;cursor:pointer;border-radius:8px;transition:all 0.2s;}
.tab.active{background:var(--accent-blue);color:white;}
.tab-content{display:none;}
.tab-content.active{display:block;}

.kanban-board{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px;margin-bottom:30px;}
.kanban-column{background:var(--bg-card);border-radius:12px;padding:20px;border:1px solid var(--border);min-height:300px;}
.column-header{font-weight:600;margin-bottom:15px;font-size:16px;display:flex;justify-content:space-between;align-items:center;}
.column-count{background:var(--bg-hover);padding:4px 10px;border-radius:12px;font-size:12px;}

.task-card{background:var(--bg-hover);border:1px solid var(--border);border-radius:10px;padding:16px;margin-bottom:12px;cursor:pointer;position:relative;transition:all 0.2s;}
.task-card:hover{transform:translateY(-2px);border-color:var(--accent-blue);box-shadow:0 4px 12px rgba(59,130,246,0.2);}
.task-card.in-progress{border-left:4px solid var(--accent-blue);}
.task-card.done{border-left:4px solid var(--accent-green);}
.task-card.failed{border-left:4px solid var(--accent-red);}

.task-header{display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;}
.task-title{font-weight:600;font-size:15px;line-height:1.4;}
.task-priority{padding:4px 8px;border-radius:6px;font-size:11px;font-weight:600;text-transform:uppercase;}
.priority-critical{background:rgba(239,68,68,0.2);color:var(--accent-red);}
.priority-high{background:rgba(245,158,11,0.2);color:var(--accent-orange);}
.priority-medium{background:rgba(59,130,246,0.2);color:var(--accent-blue);}
.priority-low{background:rgba(107,114,128,0.2);color:var(--text-secondary);}

.task-description{font-size:13px;color:var(--text-secondary);margin-bottom:12px;line-height:1.5;}
.task-subtasks{font-size:12px;color:var(--text-secondary);margin:8px 0;}
.subtask-item{display:flex;align-items:center;gap:6px;margin:4px 0;padding:4px 8px;background:var(--bg-card);border-radius:4px;}
.task-progress-bar{position:absolute;bottom:0;left:0;height:3px;border-radius:0 0 10px 10px;transition:width 0.3s ease;}
.task-progress-bar.low{background:linear-gradient(90deg,var(--accent-red),var(--accent-orange));}
.task-progress-bar.medium{background:linear-gradient(90deg,var(--accent-orange),var(--accent-blue));}
.task-progress-bar.high{background:linear-gradient(90deg,var(--accent-blue),var(--accent-green));}
.task-progress-bar.complete{background:var(--accent-green);}

.task-meta{display:flex;justify-content:space-between;align-items:center;margin-top:8px;font-size:12px;color:var(--text-secondary);}
.task-actions{display:flex;gap:6px;}
.task-action-btn{padding:6px 10px;background:var(--bg-card);border:1px solid var(--border);border-radius:6px;color:var(--text-secondary);font-size:12px;cursor:pointer;transition:all 0.2s;}
.task-action-btn:hover{background:var(--accent-blue);color:white;border-color:var(--accent-blue);}

.logs-container{background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:20px;max-height:600px;overflow-y:auto;font-family:'JetBrains Mono',monospace;font-size:13px;line-height:1.8;}
.log-entry{margin-bottom:8px;padding:8px;border-radius:6px;background:var(--bg-hover);}
.log-entry.info{border-left:3px solid var(--accent-blue);}
.log-entry.success{border-left:3px solid var(--accent-green);}
.log-entry.error{border-left:3px solid var(--accent-red);}
.log-entry.warning{border-left:3px solid var(--accent-orange);}
.log-time{color:var(--text-secondary);font-size:11px;}
.log-task{color:var(--accent-blue);font-weight:600;}

.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:20px;}
.stat-card{background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:16px;}
.stat-label{font-size:12px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;}
.stat-value{font-size:28px;font-weight:700;}

.loading{display:inline-flex;gap:6px;margin-left:8px;}
.loading-dot{width:6px;height:6px;background:var(--accent-blue);border-radius:50%;animation:bounce 1.4s ease-in-out infinite;}
.loading-dot:nth-child(2){animation-delay:0.2s;}
.loading-dot:nth-child(3){animation-delay:0.4s;}
@keyframes bounce{0%,80%,100%{transform:scale(0);}40%{transform:scale(1);}}

::-webkit-scrollbar{width:10px;}
::-webkit-scrollbar-track{background:var(--bg-hover);}
::-webkit-scrollbar-thumb{background:var(--border);border-radius:5px;}
::-webkit-scrollbar-thumb:hover{background:var(--accent-blue);}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="logo">🤖 AI Project Manager</div>
    <div class="status-indicator">
      <span class="status-dot disconnected" id="wsStatus"></span>
      <span id="wsStatusText">Подключение...</span>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">Всего задач</div>
      <div class="stat-value" id="totalTasks">0</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">В работе</div>
      <div class="stat-value" style="color:var(--accent-blue);" id="inProgressTasks">0</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Завершено</div>
      <div class="stat-value" style="color:var(--accent-green);" id="doneTasks">0</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Ошибок</div>
      <div class="stat-value" style="color:var(--accent-red);" id="failedTasks">0</div>
    </div>
  </div>

  <div class="prompt-container">
    <div class="prompt-header">Создать новую задачу</div>
    <form class="prompt-form" id="taskForm">
      <input type="text" class="prompt-input" id="taskTitle" placeholder="Название задачи (например: Добавить поиск пользователей)" required>
      <textarea class="prompt-input prompt-textarea" id="taskDescription" placeholder="Подробное описание задачи..." required></textarea>
      <div class="prompt-options">
        <select class="prompt-select" id="taskType">
          <option value="feature">🎨 Feature - Новая функция</option>
          <option value="bugfix">🐛 Bugfix - Исправление</option>
          <option value="refactor">♻️ Refactor - Рефакторинг</option>
          <option value="test">🧪 Test - Тесты</option>
          <option value="docs">📝 Docs - Документация</option>
        </select>
        <select class="prompt-select" id="taskPriority">
          <option value="low">🟢 Low - Низкий</option>
          <option value="medium" selected>🟡 Medium - Средний</option>
          <option value="high">🟠 High - Высокий</option>
          <option value="critical">🔴 Critical - Критический</option>
        </select>
        <label style="display:flex;align-items:center;gap:8px;color:white;">
          <input type="checkbox" id="autoExecute" checked> Автозапуск
        </label>
      </div>
      <button type="submit" class="btn-create" id="createBtn">Создать и запустить</button>
    </form>
  </div>

  <div class="tabs">
    <button class="tab active" data-tab="kanban">📊 Канбан</button>
    <button class="tab" data-tab="logs">📜 Логи</button>
  </div>

  <div class="tab-content active" id="kanban">
    <div class="kanban-board">
      <div class="kanban-column">
        <div class="column-header">📝 К ВЫПОЛНЕНИЮ <span class="column-count" id="todoCount">0</span></div>
        <div id="todoColumn"></div>
      </div>
      <div class="kanban-column">
        <div class="column-header">⚙️ В РАБОТЕ <span class="column-count" id="inProgressCount">0</span></div>
        <div id="inProgressColumn"></div>
      </div>
      <div class="kanban-column">
        <div class="column-header">✅ ГОТОВО <span class="column-count" id="doneCount">0</span></div>
        <div id="doneColumn"></div>
      </div>
      <div class="kanban-column">
        <div class="column-header">❌ ОШИБКИ <span class="column-count" id="failedCount">0</span></div>
        <div id="failedColumn"></div>
      </div>
    </div>
  </div>

  <div class="tab-content" id="logs">
    <div class="logs-container" id="logsContainer">
      <div style="color:var(--text-secondary);text-align:center;padding:40px;">Логи пока пусты</div>
    </div>
  </div>
</div>

<script>
const API_URL = 'http://localhost:5000/api/ai-agent';
const WS_URL = 'ws://localhost:5000';

let tasks = [];
let ws = null;

// Инициализация
init();

function init() {
  loadTasks();
  connectWebSocket();
  initTabs();
  initForm();
}

// WebSocket подключение
function connectWebSocket() {
  try {
    ws = new WebSocket(WS_URL + '/ws/tasks');
    
    ws.onopen = () => {
      console.log('✅ WebSocket подключен');
      document.getElementById('wsStatus').className = 'status-dot connected';
      document.getElementById('wsStatusText').textContent = 'Подключено';
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'task_update') {
        updateTask(data.task);
      }
    };
    
    ws.onerror = (error) => {
      console.error('❌ WebSocket ошибка:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket отключен, переподключение через 3 сек...');
      document.getElementById('wsStatus').className = 'status-dot disconnected';
      document.getElementById('wsStatusText').textContent = 'Переподключение...';
      setTimeout(connectWebSocket, 3000);
    };
  } catch (error) {
    console.error('Ошибка WebSocket:', error);
    setTimeout(connectWebSocket, 3000);
  }
}

// Загрузка задач
async function loadTasks() {
  try {
    const response = await fetch(API_URL + '/tasks');
    const data = await response.json();
    if (data.success) {
      tasks = data.tasks;
      renderKanban();
      renderLogs();
      updateStats();
    }
  } catch (error) {
    console.error('Ошибка загрузки задач:', error);
  }
}

// Обновление одной задачи
function updateTask(task) {
  const idx = tasks.findIndex(t => t.id === task.id);
  if (idx !== -1) {
    tasks[idx] = task;
  } else {
    tasks.push(task);
  }
  renderKanban();
  renderLogs();
  updateStats();
}

// Render Kanban
function renderKanban() {
  const columns = {
    todo: document.getElementById('todoColumn'),
    in_progress: document.getElementById('inProgressColumn'),
    done: document.getElementById('doneColumn'),
    failed: document.getElementById('failedColumn')
  };
  
  Object.values(columns).forEach(col => col.innerHTML = '');
  const counts = {todo:0, in_progress:0, done:0, failed:0};
  
  tasks.forEach(task => {
    const column = task.status === 'testing' ? 'in_progress' : task.status;
    if (columns[column]) {
      columns[column].innerHTML += renderTaskCard(task);
      counts[column]++;
    }
  });
  
  document.getElementById('todoCount').textContent = counts.todo;
  document.getElementById('inProgressCount').textContent = counts.in_progress;
  document.getElementById('doneCount').textContent = counts.done;
  document.getElementById('failedCount').textContent = counts.failed;
}

// Render Task Card
function renderTaskCard(task) {
  const typeEmoji = {feature:'🎨',bugfix:'🐛',refactor:'♻️',test:'🧪',docs:'📝'};
  const progress = task.progress || 0;
  const progressClass = progress < 30 ? 'low' : progress < 70 ? 'medium' : progress < 100 ? 'high' : 'complete';
  
  let subtasksHtml = '';
  if (task.subtasks && task.subtasks.length > 0) {
    subtasksHtml = '<div class="task-subtasks">' +
      task.subtasks.map(st => 
        \`<div class="subtask-item">\${st.done ? '✅' : '⬜'} \${st.title}</div>\`
      ).join('') +
      '</div>';
  }
  
  return \`
    <div class="task-card \${task.status}" onclick="viewTask(\${task.id})">
      <div class="task-header">
        <div class="task-title">\${task.title}</div>
        <div class="task-priority priority-\${task.priority}">\${task.priority}</div>
      </div>
      <div class="task-description">\${task.description.substring(0,100)}\${task.description.length>100?'...':''}</div>
      \${subtasksHtml}
      <div class="task-meta">
        <div>\${typeEmoji[task.type]||'📌'} \${task.type}</div>
        <div class="task-actions">
          \${task.status==='todo'?\`<button class="task-action-btn" onclick="event.stopPropagation();executeTask(\${task.id})">▶️ Запустить</button>\`:''}
          \${task.status==='todo'?\`<button class="task-action-btn" onclick="event.stopPropagation();decomposeTask(\${task.id})">🔀 Разбить</button>\`:''}
        </div>
      </div>
      <div class="task-progress-bar \${progressClass}" style="width:\${progress}%;"></div>
    </div>
  \`;
}

// Render Logs
function renderLogs() {
  const container = document.getElementById('logsContainer');
  container.innerHTML = '';
  
  let allLogs = [];
  tasks.forEach(task => {
    task.logs?.forEach(log => {
      allLogs.push({...log, taskTitle: task.title, taskId: task.id});
    });
  });
  
  allLogs.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  if (allLogs.length === 0) {
    container.innerHTML = '<div style="color:var(--text-secondary);text-align:center;padding:40px;">Логи пока пусты</div>';
    return;
  }
  
  allLogs.slice(0,100).forEach(log => {
    const div = document.createElement('div');
    div.className = 'log-entry ' + (log.type || 'info');
    div.innerHTML = \`
      <div class="log-time">\${new Date(log.timestamp).toLocaleTimeString()}</div>
      <div class="log-task">[\${log.taskTitle}]</div>
      <div>\${log.message}</div>
    \`;
    container.appendChild(div);
  });
}

// Update Stats
function updateStats() {
  document.getElementById('totalTasks').textContent = tasks.length;
  document.getElementById('inProgressTasks').textContent = tasks.filter(t=>t.status==='in_progress'||t.status==='testing').length;
  document.getElementById('doneTasks').textContent = tasks.filter(t=>t.status==='done').length;
  document.getElementById('failedTasks').textContent = tasks.filter(t=>t.status==='failed').length;
}

// Tabs
function initTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });
}

// Form
function initForm() {
  document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = document.getElementById('createBtn');
    btn.disabled = true;
    btn.innerHTML = 'Создание... <div class="loading"><div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div></div>';
    
    const taskData = {
      title: document.getElementById('taskTitle').value,
      description: document.getElementById('taskDescription').value,
      type: document.getElementById('taskType').value,
      priority: document.getElementById('taskPriority').value,
      autoExecute: document.getElementById('autoExecute').checked
    };
    
    try {
      const response = await fetch(API_URL + '/create-task', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(taskData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        document.getElementById('taskForm').reset();
        await loadTasks();
      } else {
        alert('Ошибка: ' + data.error);
      }
    } catch (error) {
      alert('Ошибка создания задачи: ' + error.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Создать и запустить';
    }
  });
}

// Execute Task
async function executeTask(id) {
  try {
    await fetch(API_URL + '/tasks/' + id + '/execute', {method: 'POST'});
  } catch (error) {
    alert('Ошибка: ' + error.message);
  }
}

// Decompose Task
async function decomposeTask(id) {
  try {
    const response = await fetch(API_URL + '/tasks/' + id + '/decompose', {method: 'POST'});
    const data = await response.json();
    if (data.success) {
      alert('Задача разбита на ' + data.subtasks.length + ' подзадач!');
      await loadTasks();
    }
  } catch (error) {
    alert('Ошибка: ' + error.message);
  }
}

// View Task (можно расширить)
function viewTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  console.log('Task:', task);
}

// Auto-refresh каждые 10 секунд
setInterval(loadTasks, 10000);
</script>
</body>
</html>
  `);
});

module.exports = router;