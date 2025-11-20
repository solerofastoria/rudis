const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messagesController');
const authenticate = require('../middleware/auth');

// Применяем аутентификацию ко всем маршрутам
router.use(authenticate);

// GET /api/messages - Получение всех публичных сообщений
router.get('/', messagesController.getMessages);

// GET /api/messages/direct/:userId - Получение личных сообщений с пользователем
router.get('/direct/:userId', messagesController.getDirectMessages);

// POST /api/messages - Создание нового сообщения
router.post('/', messagesController.createMessage);

// PUT /api/messages/:id - Редактирование сообщения
router.put('/:id', messagesController.updateMessage);

// DELETE /api/messages/:id - Удаление сообщения
router.delete('/:id', messagesController.deleteMessage);

module.exports = router;
