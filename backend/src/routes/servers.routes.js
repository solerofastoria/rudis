const express = require("express");
const serversController = require("../controllers/serversController");
const authenticate = require("../middleware/auth");
const multer = require('multer');

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.mimetype.split('/')[1]);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const router = express.Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// Создание сервера
router.post("/create", upload.single('icon'), serversController.createServer);

// Получение списка серверов пользователя
router.get("/", serversController.getUserServers);

// Получение информации о сервере
router.get("/:serverId", serversController.getServer);

module.exports = router;