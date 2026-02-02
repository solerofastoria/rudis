const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Тестовый маршрут для проверки работы сервера
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Эндпоинт для создания сервера
app.post('/api/servers/create', upload.single('icon'), (req, res) => {
  try {
    const { name, template = 'default', region = 'eu-west', privacy = 'public' } = req.body;
    
    // Валидация
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NAME_TOO_SHORT',
          message: 'Название должно содержать минимум 2 символа'
        }
      });
    }
    
    if (name.length > 100) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NAME_TOO_LONG',
          message: 'Название не должно превышать 100 символов'
        }
      });
    }
    
    // Имитация создания сервера
    const server = {
      id: 'srv_' + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      icon_url: req.file ? `/uploads/${req.file.filename}` : null,
      invite_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      owner_id: 'user_123456',
      created_at: new Date().toISOString(),
      channels: [
        { id: 'ch_1', name: 'общение', type: 'text' },
        { id: 'ch_2', name: 'голосовой', type: 'voice' }
      ]
    };
    
    // Имитация задержки для реалистичности
    setTimeout(() => {
      res.status(201).json({
        success: true,
        server: server
      });
    }, 1000);
  } catch (error) {
    console.error('Server creation error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Ошибка при создании сервера'
      }
    });
  }
});

// Эндпоинт для получения списка серверов пользователя
app.get('/api/servers', (req, res) => {
  // Имитация списка серверов
  const servers = [
    {
      id: 'srv_1',
      name: 'Тестовый сервер',
      icon_url: null,
      invite_code: 'ABC123',
      owner_id: 'user_123456',
      created_at: new Date().toISOString(),
      channels: [
        { id: 'ch_1', name: 'общение', type: 'text' },
        { id: 'ch_2', name: 'голосовой', type: 'voice' }
      ]
    }
  ];
  
  res.json({
    success: true,
    servers: servers
  });
});

// Эндпоинт для получения информации о сервере
app.get('/api/servers/:serverId', (req, res) => {
  const { serverId } = req.params;
  
  // Имитация информации о сервере
  const server = {
    id: serverId,
    name: 'Тестовый сервер',
    icon_url: null,
    invite_code: 'ABC123',
    owner_id: 'user_123456',
    created_at: new Date().toISOString(),
    channels: [
      { id: 'ch_1', name: 'общение', type: 'text' },
      { id: 'ch_2', name: 'голосовой', type: 'voice' }
    ]
  };
  
  res.json({
    success: true,
    server: server
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Тестовый сервер запущен на порту ${PORT}`);
  console.log(` health check: http://localhost:${PORT}/api/health`);
});