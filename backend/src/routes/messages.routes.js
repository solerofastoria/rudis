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

// GET /api/messages/unread - Получение непрочитанных сообщений
router.get('/unread', messagesController.getUnreadMessages);

// POST /api/messages/read/:userId - Пометить сообщения как прочитанные
router.post('/read/:userId', messagesController.markMessagesAsRead);

router.post('/mark-as-read/:userId', messagesController.markMessagesAsRead);

// POST /api/messages - Создание нового сообщения
router.post('/', messagesController.createMessage);

// PUT /api/messages/:id - Редактирование сообщения
router.put('/:id', messagesController.updateMessage);

// DELETE /api/messages/:id - Удаление сообщения
router.delete('/:id', messagesController.deleteMessage);

module.exports = router;
