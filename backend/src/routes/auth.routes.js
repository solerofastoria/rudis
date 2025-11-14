const express = require('express');
const router = express.Router();

// Импортируем контроллеры
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

console.log('✅ authController:', Object.keys(authController));
console.log('✅ authenticate:', typeof authenticate);

// Публичные маршруты
router.post('/register', authController.register);
router.post('/login', authController.login);

// Защищенные маршруты
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authenticate, authController.logout);
console.log('✅ auth.routes.js загружен');

module.exports = router;
