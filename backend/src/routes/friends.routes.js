const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const {
  getFriends,
  getFriendRequests,
  addFriend,
  acceptFriend,
  rejectFriend,
  removeFriend
} = require('../controllers/friendsController');

// Все маршруты требуют аутентификации
router.use(authenticate);

// Получение списка друзей
router.get('/', getFriends);

// Получение входящих запросов дружбы
router.get('/requests', getFriendRequests);

// Добавление в друзья
router.post('/add', addFriend);

// Принятие запроса дружбы
router.post('/accept', acceptFriend);

// Отклонение запроса дружбы
router.post('/reject', rejectFriend);

// Удаление из друзей
router.post('/remove', removeFriend);

module.exports = router;