const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store connected users
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Handle user authentication
  socket.on('authenticate', (data) => {
    if (data.userId) {
      connectedUsers.set(socket.id, data.userId);
      console.log(`User ${data.userId} authenticated with socket ${socket.id}`);
    }
  });
  
  // Handle chat messages
  socket.on('chat:send', (message) => {
    console.log('Received message:', message);
    // Broadcast to all connected clients
    io.emit('chat:newMessage', message);
  });
  
  // Handle typing indicators
  socket.on('typing:start', (data) => {
    socket.broadcast.emit('typing:start', { userId: connectedUsers.get(socket.id) });
  });
  
  socket.on('typing:stop', (data) => {
    socket.broadcast.emit('typing:stop', { userId: connectedUsers.get(socket.id) });
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    connectedUsers.delete(socket.id);
  });
});

// Routes
const authRoutes = require('./routes/auth.routes');
const messagesRoutes = require('./routes/messages.routes');

app.use('/api/auth', authRoutes);
app.use('/api/messages', messagesRoutes);

// Тестовый маршрут
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Сервер работает!',
    timestamp: new Date().toISOString(),
    note: 'Базы данных пока не подключены'
  });
});

// Маршрут для теста аутентификации
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API работает нормально!',
    nextSteps: 'Настройте базы данных'
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
});