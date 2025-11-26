const { User } = require("../models");
const { success, error } = require("../utils/response");

// Получение информации о пользователе по ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Если запрашивается информация о себе, возвращаем полную информацию
    if (id === req.user.id) {
      return success(res, { user: req.user.toSafeObject() });
    }
    
    // Для других пользователей возвращаем только публичную информацию
    const user = await User.findByPk(id, {
      attributes: ['id', 'username', 'avatar', 'status', 'online', 'lastSeen']
    });
    
    if (!user) {
      return error(res, "Пользователь не найден", 404);
    }
    
    return success(res, { user });
  } catch (e) {
    console.error("Get user by id error:", e);
    return error(res, "Ошибка сервера", 500);
  }
};

// Получение списка всех пользователей
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'avatar', 'status', 'online', 'lastSeen'],
      order: [['username', 'ASC']]
    });
    
    return success(res, users);
  } catch (e) {
    console.error("Get all users error:", e);
    return error(res, "Ошибка сервера", 500);
  }
};