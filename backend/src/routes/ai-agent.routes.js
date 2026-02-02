// backend/src/routes/ai-agent.routes.js
// AI агент с глубоким анализом проекта перед выполнением

const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Хранилище задач
let tasks = [];
let taskIdCounter = 1;
let projectContext = null; // Кэш контекста проекта

// WebSocket broadcast
let wsBroadcast = null;

router.tasks = tasks;
router.setWsBroadcast = (fn) => { wsBroadcast = fn; };

function logTask(task, message, type = 'info') {
  const log = { timestamp: new Date().toISOString(), message, type };
  task.logs.push(log);
  task.updatedAt = new Date().toISOString();
  if (wsBroadcast) wsBroadcast(task);
  console.log(`[Task ${task.id}] ${message}`);
}

// ============================================
// ГЛУБОКИЙ АНАЛИЗ ПРОЕКТА
// ============================================

/**
 * POST /analyze-full-project
 * Полный анализ проекта с AI для понимания контекста
 */
router.post('/analyze-full-project', async (req, res) => {
  try {
    console.log('🔍 Начинаю глубокий анализ проекта...');
    
    const projectPath = process.cwd();
    const structure = await scanDirectory(projectPath, 0, 3);
    const summary = await analyzeProjectStructure(structure);
    
    // Читаем ключевые файлы
    const keyFiles = await readKeyFiles(projectPath);
    
    // AI анализ всего проекта
    const aiAnalysis = await analyzeProjectWithAI(structure, summary, keyFiles);
    
    // Кэшируем контекст
    projectContext = {
      structure,
      summary,
      keyFiles,
      aiAnalysis,
      analyzedAt: new Date().toISOString()
    };
    
    console.log('✅ Анализ проекта завершен');
    
    res.json({
      success: true,
      projectContext,
      message: 'Проект полностью проанализирован'
    });
  } catch (error) {
    console.error('❌ Ошибка анализа проекта:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /project-context
 * Получить текущий контекст проекта
 */
router.get('/project-context', (req, res) => {
  if (!projectContext) {
    return res.json({
      success: false,
      message: 'Проект еще не проанализирован. Запустите /analyze-full-project'
    });
  }
  
  res.json({
    success: true,
    projectContext
  });
});

/**
 * Чтение ключевых файлов проекта
 */
async function readKeyFiles(projectPath) {
  const keyFiles = {};
  
  const filesToRead = [
    'package.json',
    'src/app.js',
    'src/routes/auth.routes.js',
    'README.md',
    '.env.example'
  ];
  
  for (const file of filesToRead) {
    try {
      const filePath = path.join(projectPath, file);
      const content = await fs.readFile(filePath, 'utf-8');
      keyFiles[file] = content.substring(0, 3000); // Первые 3000 символов
    } catch (error) {
      // Файл не существует, пропускаем
    }
  }
  
  return keyFiles;
}

/**
 * AI анализ всего проекта
 */
async function analyzeProjectWithAI(structure, summary, keyFiles) {
  const prompt = `
Ты - Senior Software Architect. Проанализируй этот проект детально.

СТРУКТУРА ПРОЕКТА:
- Файлов: ${summary.totalFiles}
- Директорий: ${summary.totalDirectories}
- Языки: ${summary.languages.join(', ')}
- Типы файлов: ${JSON.stringify(summary.fileTypes)}

КЛЮЧЕВЫЕ ФАЙЛЫ:
${Object.entries(keyFiles).map(([name, content]) => `
=== ${name} ===
${content.substring(0, 500)}
`).join('\n')}

СТРУКТУРА ДИРЕКТОРИЙ (первый уровень):
${JSON.stringify(structure.map(s => s.name), null, 2)}

Определи и верни в JSON формате:
{
  "projectType": "тип проекта (fullstack/backend/frontend)",
  "frameworks": ["список используемых фреймворков"],
  "architecture": "архитектурный паттерн",
  "techStack": {
    "backend": ["технологии"],
    "frontend": ["технологии"],
    "database": ["БД"],
    "tools": ["инструменты"]
  },
  "conventions": {
    "codeStyle": "стиль кода",
    "namingConventions": "соглашения по именованию",
    "folderStructure": "структура папок"
  },
  "recommendations": ["рекомендации по работе с проектом"]
}

Верни ТОЛЬКО валидный JSON!
`;

  try {
    const response = await aiService.chat(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (error) {
    console.error('Ошибка AI анализа:', error);
    return null;
  }
}

// ============================================
// ОСНОВНЫЕ МАРШРУТЫ
// ============================================

router.post('/scan-project', async (req, res) => {
  try {
    const { projectPath = process.cwd() } = req.body;
    console.log('🔍 Сканирование проекта:', projectPath);
    
    const structure = await scanDirectory(projectPath, 0, 3);
    const summary = await analyzeProjectStructure(structure);
    
    res.json({ success: true, structure, summary, projectPath });
  } catch (error) {
    console.error('❌ Ошибка сканирования:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/read-file', async (req, res) => {
  try {
    const { filePath } = req.body;
    if (!filePath) return res.status(400).json({ error: 'filePath обязателен' });

    const absolutePath = path.resolve(filePath);
    const projectRoot = process.cwd();
    
    if (!absolutePath.startsWith(projectRoot)) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const content = await fs.readFile(absolutePath, 'utf-8');
    const stats = await fs.stat(absolutePath);

    res.json({
      success: true,
      content,
      filePath: absolutePath,
      size: stats.size,
      modified: stats.mtime
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/write-file', async (req, res) => {
  try {
    const { filePath, content, createBackup = true } = req.body;
    if (!filePath || content === undefined) {
      return res.status(400).json({ error: 'filePath и content обязательны' });
    }

    // ВАЖНО: Используем абсолютный путь от корня проекта
    const absolutePath = path.resolve(process.cwd(), filePath);
    const projectRoot = process.cwd();
    
    if (!absolutePath.startsWith(projectRoot)) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    console.log('📝 Запись файла:', absolutePath);

    // Создаем бэкап
    if (createBackup) {
      try {
        const backupPath = absolutePath + '.backup-' + Date.now();
        await fs.copyFile(absolutePath, backupPath);
        console.log(`✅ Бэкап создан: ${backupPath}`);
      } catch (err) {
        // Файл не существует
      }
    }

    // Создаем директории
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    
    // Записываем файл
    await fs.writeFile(absolutePath, content, 'utf-8');
    console.log(`✅ Файл записан: ${absolutePath}`);

    res.json({
      success: true,
      filePath: absolutePath,
      message: 'Файл успешно записан'
    });
  } catch (error) {
    console.error('❌ Ошибка записи файла:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/create-task', async (req, res) => {
  try {
    const {
      title,
      description,
      type = 'feature',
      priority = 'medium',
      autoExecute = false
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'title и description обязательны' });
    }

    const task = {
      id: taskIdCounter++,
      title,
      description,
      type,
      priority,
      status: 'todo',
      autoExecute,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subtasks: [],
      logs: [],
      filesCreated: [],
      filesModified: [],
      progress: 0,
      projectAnalysis: null // Будет заполнен при выполнении
    };

    tasks.push(task);
    logTask(task, 'Задача создана', 'success');

    if (autoExecute) {
      executeTaskAsync(task.id);
    }

    res.json({ success: true, task });
  } catch (error) {
    console.error('❌ Ошибка создания задачи:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/tasks', (req, res) => {
  try {
    let filteredTasks = [...tasks];
    const { status, type } = req.query;
    if (status) filteredTasks = filteredTasks.filter(t => t.status === status);
    if (type) filteredTasks = filteredTasks.filter(t => t.type === type);
    res.json({ success: true, tasks: filteredTasks, total: tasks.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/tasks/:id', (req, res) => {
  try {
    const task = tasks.find(t => t.id === parseInt(req.params.id));
    if (!task) return res.status(404).json({ error: 'Задача не найдена' });
    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tasks/:id/execute', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const task = tasks.find(t => t.id === taskId);

    if (!task) return res.status(404).json({ error: 'Задача не найдена' });
    if (task.status === 'in_progress') {
      return res.status(400).json({ error: 'Задача уже выполняется' });
    }

    executeTaskAsync(taskId);
    res.json({ success: true, message: 'Задача запущена', taskId });
  } catch (error) {
    console.error('❌ Ошибка запуска задачи:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tasks/:id/decompose', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const task = tasks.find(t => t.id === taskId);
    if (!task) return res.status(404).json({ error: 'Задача не найдена' });

    logTask(task, 'Начинаю декомпозицию задачи...', 'info');
    const subtasks = await decomposeTaskWithAI(task);
    task.subtasks = subtasks;
    logTask(task, `Задача разбита на ${subtasks.length} подзадач`, 'success');

    res.json({ success: true, task, subtasks });
  } catch (error) {
    console.error('❌ Ошибка декомпозиции:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// AI ВЫПОЛНЕНИЕ ЗАДАЧИ
// ============================================

async function executeTaskAsync(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  try {
    task.status = 'in_progress';
    task.progress = 0;
    logTask(task, '🚀 AI агент начал работу', 'info');

    // ШАГ 1: ПОЛНЫЙ АНАЛИЗ ПРОЕКТА
    logTask(task, '🔍 Анализирую структуру проекта...', 'info');
    
    if (!projectContext) {
      const projectPath = process.cwd();
      const structure = await scanDirectory(projectPath, 0, 3);
      const summary = await analyzeProjectStructure(structure);
      const keyFiles = await readKeyFiles(projectPath);
      const aiAnalysis = await analyzeProjectWithAI(structure, summary, keyFiles);
      
      projectContext = { structure, summary, keyFiles, aiAnalysis };
    }
    
    task.projectAnalysis = projectContext;
    task.progress = 10;
    logTask(task, '✅ Проект проанализирован', 'success');

    // ШАГ 2: ДЕТАЛЬНОЕ ПЛАНИРОВАНИЕ
    logTask(task, '📋 Создаю детальный план выполнения...', 'info');
    
    const detailedPlan = await createDetailedPlan(task, projectContext);
    task.subtasks = detailedPlan.subtasks;
    task.progress = 20;
    
    logTask(task, `✅ План создан: ${task.subtasks.length} подзадач`, 'success');
    logTask(task, `📌 Файлы для работы: ${detailedPlan.filesToModify.join(', ')}`, 'info');

    // ШАГ 3: ВЫПОЛНЕНИЕ ПОДЗАДАЧ
    for (let i = 0; i < task.subtasks.length; i++) {
      const subtask = task.subtasks[i];
      
      logTask(task, `⚙️ Подзадача ${i + 1}/${task.subtasks.length}: ${subtask.title}`, 'info');
      
      try {
        const result = await executeSubtaskWithContext(task, subtask, projectContext);
        
        subtask.done = true;
        subtask.result = result;
        task.progress = 20 + Math.round(((i + 1) / task.subtasks.length) * 70);
        
        logTask(task, `✅ Подзадача завершена: ${subtask.title}`, 'success');
        
        if (result.filesCreated) {
          result.filesCreated.forEach(f => logTask(task, `📄 Создан файл: ${f}`, 'success'));
        }
        if (result.filesModified) {
          result.filesModified.forEach(f => logTask(task, `📝 Изменен файл: ${f}`, 'info'));
        }
        
        if (wsBroadcast) wsBroadcast(task);
        
      } catch (error) {
        logTask(task, `❌ Ошибка в подзадаче "${subtask.title}": ${error.message}`, 'error');
        subtask.error = error.message;
      }
    }

    // ШАГ 4: ФИНАЛ
    task.status = 'done';
    task.progress = 100;
    logTask(task, `🎉 Задача завершена! Создано: ${task.filesCreated.length}, изменено: ${task.filesModified.length}`, 'success');

  } catch (error) {
    task.status = 'failed';
    task.progress = 0;
    logTask(task, `❌ Критическая ошибка: ${error.message}`, 'error');
    console.error('Ошибка выполнения задачи:', error);
  }

  task.updatedAt = new Date().toISOString();
  if (wsBroadcast) wsBroadcast(task);
}

/**
 * Создание детального плана с учетом контекста проекта
 */
async function createDetailedPlan(task, projectContext) {
  const prompt = `
Ты - AI Senior Developer. У тебя есть полный контекст проекта.

КОНТЕКСТ ПРОЕКТА:
${JSON.stringify(projectContext.aiAnalysis, null, 2)}

СТРУКТУРА:
- Backend: ${projectContext.structure.filter(s => s.name.includes('backend') || s.name === 'src').length > 0 ? 'Есть' : 'Нет'}
- Frontend: ${projectContext.structure.filter(s => s.name.includes('frontend') || s.name.includes('Frontend')).length > 0 ? 'Есть' : 'Нет'}

ЗАДАЧА:
Название: ${task.title}
Описание: ${task.description}
Тип: ${task.type}

Создай ДЕТАЛЬНЫЙ план выполнения. Для каждой подзадачи укажи ТОЧНЫЕ пути к файлам относительно корня проекта.

Верни JSON:
{
  "subtasks": [
    {
      "title": "название",
      "description": "детали",
      "files": ["точный/путь/к/файлу.js"],
      "dependencies": [],
      "order": 1
    }
  ],
  "filesToModify": ["список всех файлов которые будут изменены"],
  "estimatedTime": "оценка времени"
}

ВАЖНО: Пути должны быть относительно корня проекта! Например:
- backend/src/routes/auth.routes.js
- Frontend/src/components/UserCard.jsx

Верни ТОЛЬКО валидный JSON!
`;

  try {
    const response = await aiService.chat(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const plan = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    
    if (!plan) {
      throw new Error('AI не вернул валидный план');
    }
    
    plan.subtasks = plan.subtasks.map(st => ({
      ...st,
      done: false,
      result: null
    }));
    
    return plan;
  } catch (error) {
    console.error('Ошибка создания плана:', error);
    return {
      subtasks: [{
        title: 'Выполнить задачу',
        description: task.description,
        files: [],
        order: 1,
        done: false
      }],
      filesToModify: []
    };
  }
}

/**
 * Выполнение подзадачи с контекстом проекта
 */
async function executeSubtaskWithContext(task, subtask, projectContext) {
  const codePrompt = `
Ты - AI Developer с полным контекстом проекта.

АРХИТЕКТУРА ПРОЕКТА:
${JSON.stringify(projectContext.aiAnalysis, null, 2)}

ОСНОВНАЯ ЗАДАЧА:
${task.description}

ПОДЗАДАЧА:
${subtask.title}
Описание: ${subtask.description}
Файлы: ${subtask.files.join(', ')}

ИНСТРУКЦИИ:
1. Пиши код соответствующий архитектуре проекта
2. Следуй стилю кода проекта
3. Используй существующие паттерны
4. Код должен быть production-ready

Для КАЖДОГО файла используй формат:
--- FILE: относительный/путь/от/корня.js ---
// полный код файла
--- END FILE ---

Пример:
--- FILE: backend/src/routes/users.routes.js ---
const express = require('express');
const router = express.Router();
// ... код
module.exports = router;
--- END FILE ---

Пиши ТОЛЬКО код, без объяснений!
`;

  try {
    const response = await aiService.chat(codePrompt);
    const files = parseFilesFromResponse(response);
    
    const result = {
      filesCreated: [],
      filesModified: []
    };
    
    for (const file of files) {
      const exists = await fileExists(file.path);
      
      await writeFile(file.path, file.content);
      
      if (exists) {
        result.filesModified.push(file.path);
        task.filesModified.push(file.path);
      } else {
        result.filesCreated.push(file.path);
        task.filesCreated.push(file.path);
      }
    }
    
    return result;
  } catch (error) {
    throw new Error(`Ошибка выполнения подзадачи: ${error.message}`);
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(path.resolve(process.cwd(), filePath));
    return true;
  } catch {
    return false;
  }
}

async function writeFile(filePath, content) {
  const absolutePath = path.resolve(process.cwd(), filePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, content, 'utf-8');
}

function parseFilesFromResponse(response) {
  const files = [];
  const fileRegex = /---\s*FILE:\s*(.+?)\s*---\n([\s\S]*?)---\s*END FILE\s*---/gi;
  let match;
  
  while ((match = fileRegex.exec(response)) !== null) {
    files.push({
      path: match[1].trim(),
      content: match[2].trim()
    });
  }
  
  if (files.length === 0) {
    const codeBlockRegex = /```(?:javascript|js|jsx|typescript|ts|tsx)?\n([\s\S]*?)```/gi;
    let codeMatch;
    let index = 0;
    
    while ((codeMatch = codeBlockRegex.exec(response)) !== null) {
      const beforeCode = response.substring(Math.max(0, codeMatch.index - 200), codeMatch.index);
      const pathMatch = beforeCode.match(/(?:FILE|file|путь|path):\s*([^\s\n]+)/i);
      const fileName = pathMatch ? pathMatch[1] : `generated-${index++}.js`;
      files.push({ path: fileName, content: codeMatch[1].trim() });
    }
  }
  
  return files;
}

async function decomposeTaskWithAI(task) {
  // ... (оставляем как было)
  return [{
    title: 'Выполнить задачу',
    description: task.description,
    files: [],
    done: false
  }];
}

function getLanguageFromPath(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const langMap = {
    '.js': 'javascript', '.jsx': 'javascript',
    '.ts': 'typescript', '.tsx': 'typescript',
    '.py': 'python', '.java': 'java'
  };
  return langMap[ext] || 'javascript';
}

async function scanDirectory(dirPath, depth = 0, maxDepth = 3) {
  if (depth > maxDepth) return null;
  const items = await fs.readdir(dirPath);
  const structure = [];
  const ignoreDirs = ['node_modules', '.git', 'dist', 'build', 'coverage', '.next', 'uploads'];

  for (const item of items) {
    if (ignoreDirs.includes(item) || item.endsWith('.backup')) continue;
    const itemPath = path.join(dirPath, item);
    try {
      const stats = await fs.stat(itemPath);
      if (stats.isDirectory()) {
        const children = await scanDirectory(itemPath, depth + 1, maxDepth);
        structure.push({ name: item, type: 'directory', path: itemPath, children: children || [] });
      } else {
        structure.push({ name: item, type: 'file', path: itemPath, size: stats.size, extension: path.extname(item) });
      }
    } catch (err) {
      continue;
    }
  }
  return structure;
}

async function analyzeProjectStructure(structure) {
  const stats = { totalFiles: 0, totalDirectories: 0, fileTypes: {}, languages: [] };
  function traverse(node) {
    if (node.type === 'file') {
      stats.totalFiles++;
      const ext = node.extension || 'none';
      stats.fileTypes[ext] = (stats.fileTypes[ext] || 0) + 1;
    } else if (node.type === 'directory' && node.children) {
      stats.totalDirectories++;
      node.children.forEach(traverse);
    }
  }
  structure.forEach(traverse);
  const langMap = {
    '.js': 'JavaScript', '.jsx': 'React', '.ts': 'TypeScript', '.tsx': 'React TypeScript',
    '.py': 'Python', '.java': 'Java'
  };
  stats.languages = Object.keys(stats.fileTypes).filter(ext => langMap[ext]).map(ext => langMap[ext]);
  return stats;
}

module.exports = router;