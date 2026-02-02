const { User, Friend } = require("../models");
const { Op } = require('sequelize');
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
      attributes: ['id', 'username', 'avatar', 'status', 'online', 'last_seen']
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
    const { friends } = req.query;
    
    // Если указан параметр friends=true, возвращаем только друзей
    if (friends === 'true') {
      // Получаем список друзей текущего пользователя
      const friendships = await Friend.findAll({
        where: {
          [Op.or]: [
            { user_id: req.user.id },
            { friend_id: req.user.id }
          ],
          status: 'accepted'
        },
        include: [
          {
            model: User,
            as: 'friend',
            attributes: ['id', 'username', 'avatar', 'status', 'online', 'last_seen'],
            where: {
              id: {
                [Op.ne]: req.user.id
              }
            }
          },
          {
            model: User,
            as: 'user',
            attributes: [],
            where: {
              id: {
                [Op.ne]: req.user.id
              }
            }
          }
        ]
      });
      
      // Извлекаем уникальных друзей из записей дружбы
      const friendUsers = [];
      const friendIds = new Set();
      
      friendships.forEach(friendship => {
        // Определяем, кто является другом (не текущий пользователь)
        const friend = friendship.user_id === req.user.id ? friendship.friend : friendship.user;
        
        // Добавляем друга в список, если он еще не добавлен
        if (!friendIds.has(friend.id)) {
          friendUsers.push(friend);
          friendIds.add(friend.id);
        }
      });
      
      return success(res, friendUsers);
    }
    
    // По умолчанию возвращаем всех пользователей
    const users = await User.findAll({
      attributes: ['id', 'username', 'avatar', 'status', 'online', 'last_seen'],
      order: [['username', 'ASC']]
    });
    
    return success(res, users);
  } catch (e) {
    console.error("Get all users error:", e);
    return error(res, "Ошибка сервера", 500);
  }
};