const { Friend, User } = require('../models');
const { Op } = require('sequelize');

// Получение списка друзей пользователя
const getFriends = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Получаем все записи дружбы, где пользователь является инициатором или получателем (принятые запросы)
    const friendships = await Friend.findAll({
      where: {
        [Op.or]: [
          { user_id: userId },
          { friend_id: userId }
        ],
        status: 'accepted'
      },
      include: [
        {
          model: User,
          as: 'friend',
          attributes: ['id', 'username', 'status', 'online', 'last_seen'],
          required: false
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'status', 'online', 'last_seen'],
          required: false
        }
      ]
    });
    
    // Извлекаем уникальных друзей из записей дружбы
    const friendUsers = [];
    const friendIds = new Set();
    
    friendships.forEach(friendship => {
      // Определяем, кто является другом (не текущий пользователь)
      let friend;
      if (friendship.user_id === userId) {
        friend = friendship.friend;
      } else if (friendship.friend_id === userId) {
        friend = friendship.user;
      }
      
      // Добавляем друга в список, если он еще не добавлен
      if (friend && friend.id !== userId && !friendIds.has(friend.id)) {
        friendUsers.push(friend);
        friendIds.add(friend.id);
      }
    });
    
    res.json({
      success: true,
      data: friendUsers
    });
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении списка друзей'
    });
  }
};

// Получение входящих запросов дружбы
const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Получаем все входящие запросы дружбы (где пользователь является получателем)
    const friendRequests = await Friend.findAll({
      where: {
        friend_id: userId,
        status: 'pending'
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username']
      }]
    });
    
    const requests = friendRequests.map(request => ({
      id: request.id,
      user_id: request.user.id,
      username: request.user.username
    }));
    
    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении запросов дружбы'
    });
  }
};

// Добавление в друзья
const addFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.body;
    
    // Проверяем, что пользователь не пытается добавить себя
    if (userId === friendId) {
      return res.status(400).json({
        success: false,
        message: 'Нельзя добавить себя в друзья'
      });
    }
    
    // Проверяем, существует ли пользователь
    const friendUser = await User.findByPk(friendId);
    if (!friendUser) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }
    
    // Проверяем, существует ли уже запрос дружбы в одном направлении
    const existingRequest = await Friend.findOne({
      where: {
        user_id: userId,
        friend_id: friendId
      }
    });
    
    if (existingRequest) {
      if (existingRequest.status === 'accepted') {
        return res.status(400).json({
          success: false,
          message: 'Этот пользователь уже у вас в друзьях'
        });
      } else if (existingRequest.status === 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Запрос дружбы уже отправлен'
        });
      }
    }
    
    // Проверяем, существует ли обратный запрос дружбы
    const reverseRequest = await Friend.findOne({
      where: {
        user_id: friendId,
        friend_id: userId
      }
    });
    
    if (reverseRequest) {
      if (reverseRequest.status === 'accepted') {
        return res.status(400).json({
          success: false,
          message: 'Этот пользователь уже у вас в друзьях'
        });
      } else if (reverseRequest.status === 'pending') {
        // Автоматически принимаем запрос дружбы
        reverseRequest.status = 'accepted';
        await reverseRequest.save();
        
        // Создаем или обновляем обратную связь
        const [forwardFriendship, created] = await Friend.findOrCreate({
          where: {
            user_id: userId,
            friend_id: friendId
          },
          defaults: {
            user_id: userId,
            friend_id: friendId,
            status: 'accepted'
          }
        });
        
        // Если запись уже существовала, обновляем её статус
        if (!created && forwardFriendship.status !== 'accepted') {
          forwardFriendship.status = 'accepted';
          await forwardFriendship.save();
        }
        
        return res.json({
          success: true,
          message: 'Запрос дружбы принят автоматически'
        });
      }
    }
    
    // Создаем запрос дружбы
    const friendRequest = await Friend.create({
      user_id: userId,
      friend_id: friendId,
      status: 'pending'
    });
    
    res.json({
      success: true,
      message: 'Запрос дружбы отправлен',
      data: friendRequest
    });
  } catch (error) {
    console.error('Error adding friend:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при отправке запроса дружбы'
    });
  }
};

// Принятие запроса дружбы
const acceptFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.body;
    
    // Находим запрос дружбы
    const friendRequest = await Friend.findOne({
      where: {
        user_id: friendId,
        friend_id: userId,
        status: 'pending'
      }
    });
    
    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: 'Запрос дружбы не найден'
      });
    }
    
    // Обновляем статус запроса
    friendRequest.status = 'accepted';
    await friendRequest.save();
    
    // Создаем или обновляем обратную связь (для отображения в списке друзей у друга)
    const [reverseFriendship, created] = await Friend.findOrCreate({
      where: {
        user_id: userId,
        friend_id: friendId
      },
      defaults: {
        user_id: userId,
        friend_id: friendId,
        status: 'accepted'
      }
    });
    
    // Если запись уже существовала, обновляем её статус
    if (!created && reverseFriendship.status !== 'accepted') {
      reverseFriendship.status = 'accepted';
      await reverseFriendship.save();
    }
    
    res.json({
      success: true,
      message: 'Запрос дружбы принят'
    });
  } catch (error) {
    console.error('Error accepting friend:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при принятии запроса дружбы'
    });
  }
};

// Отклонение запроса дружбы
const rejectFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.body;
    
    // Находим запрос дружбы
    const friendRequest = await Friend.findOne({
      where: {
        user_id: friendId,
        friend_id: userId,
        status: 'pending'
      }
    });
    
    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: 'Запрос дружбы не найден'
      });
    }
    
    // Удаляем запрос дружбы
    await friendRequest.destroy();
    
    res.json({
      success: true,
      message: 'Запрос дружбы отклонен'
    });
  } catch (error) {
    console.error('Error rejecting friend:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при отклонении запроса дружбы'
    });
  }
};

// Удаление из друзей
const removeFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.body;
    
    // Удаляем дружбу в обе стороны
    await Friend.destroy({
      where: {
        [require('sequelize').Op.or]: [
          { user_id: userId, friend_id: friendId },
          { user_id: friendId, friend_id: userId }
        ],
        status: 'accepted'
      }
    });
    
    res.json({
      success: true,
      message: 'Пользователь удален из друзей'
    });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении из друзей'
    });
  }
};

module.exports = {
  getFriends,
  getFriendRequests,
  addFriend,
  acceptFriend,
  rejectFriend,
  removeFriend
};