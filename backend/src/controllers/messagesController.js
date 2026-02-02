const { Message, User } = require("../models");
const { success, error } = require("../utils/response");

// Получение всех сообщений (публичных)
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: {
        is_direct: false
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'avatar']
        }
      ],
      order: [['created_at', 'ASC']],
      limit: 100
    });

    return success(res, messages);
  } catch (e) {
    console.error("Get messages error:", e);
    return error(res, "Ошибка сервера", 500);
  }
};

// Получение личных сообщений между двумя пользователями
exports.getDirectMessages = async (req, res) => {
  try {
    const { userId } = req.params; // ID пользователя, с которым переписываемся
    const currentUserId = req.user.id;

    const messages = await Message.findAll({
      where: {
        is_direct: true,
        [require('sequelize').Op.or]: [
          {
            [require('sequelize').Op.and]: [
              { sender_id: currentUserId },
              { recipient_id: userId }
            ]
          },
          {
            [require('sequelize').Op.and]: [
              { sender_id: userId },
              { recipient_id: currentUserId }
            ]
          }
        ]
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'username', 'avatar']
        }
      ],
      order: [['created_at', 'ASC']],
      limit: 100
    });

    return success(res, messages);
  } catch (e) {
    console.error("Get direct messages error:", e);
    return error(res, "Ошибка сервера", 500);
  }
};

// Получение непрочитанных личных сообщений
exports.getUnreadMessages = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Получаем id отправителей всех непрочитанных сообщений
    const unreadMsgs = await Message.findAll({
      where: {
        is_direct: true,
        recipient_id: currentUserId,
        is_read: false
      },
      attributes: ['sender_id']
    });

    // Считаем количество по каждому senderId
    const unreadCounts = unreadMsgs.reduce((acc, msg) => {
      acc[msg.sender_id] = (acc[msg.sender_id] || 0) + 1;
      return acc;
    }, {});

    return success(res, unreadCounts);
  } catch (e) {
    console.error("Get unread messages error:", e);
    return error(res, "Ошибка сервера", 500);
  }
};

// Пометить сообщения как прочитанные
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { userId } = req.params; // ID пользователя, чьи сообщения помечаем как прочитанные
    const currentUserId = req.user.id;

    // Помечаем все непрочитанные сообщения от этого пользователя как прочитанные
    await Message.update(
      { is_read: true },
      {
        where: {
          is_direct: true,
          sender_id: userId,
          recipient_id: currentUserId,
          is_read: false
        }
      }
    );

    return success(res, null, "Сообщения помечены как прочитанные");
  } catch (e) {
    console.error("Mark messages as read error:", e);
    return error(res, "Ошибка сервера", 500);
  }
};

// Создание нового сообщения
exports.createMessage = async (req, res) => {
  try {
    const { content, recipientId, isDirect } = req.body;
    const senderId = req.user.id;

    // Валидация
    if (!content || content.trim().length === 0) {
      return error(res, "Сообщение не может быть пустым", 400);
    }

    // Проверка существования получателя для личных сообщений
    if (isDirect && recipientId) {
      const recipient = await User.findByPk(recipientId);
      if (!recipient) {
        return error(res, "Получатель не найден", 404);
      }
    }

    const message = await Message.create({
      content: content.trim(),
      sender_id: senderId,
      recipient_id: isDirect ? recipientId : null,
      is_direct: isDirect || false,
      is_read: false // Новые сообщения по умолчанию непрочитаны
    });

    // Загружаем полную информацию о сообщении
    const fullMessage = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'username', 'avatar']
        }
      ]
    });

    return success(res, fullMessage, "Сообщение отправлено", 201);
  } catch (e) {
    console.error("Create message error:", e);
    return error(res, "Ошибка сервера", 500);
  }
};

// Редактирование сообщения
exports.updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Валидация
    if (!content || content.trim().length === 0) {
      return error(res, "Сообщение не может быть пустым", 400);
    }

    // Найти сообщение
    const message = await Message.findByPk(id);
    
    if (!message) {
      return error(res, "Сообщение не найдено", 404);
    }

    // Проверить, что пользователь является автором сообщения
    if (message.sender_id !== userId) {
      return error(res, "Нет прав для редактирования этого сообщения", 403);
    }

    // Обновить сообщение
    message.content = content.trim();
    message.is_edited = true;
    message.edited_at = new Date();
    
    await message.save();

    // Загружаем полную информацию о сообщении
    const fullMessage = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'username', 'avatar']
        }
      ]
    });

    return success(res, fullMessage, "Сообщение обновлено");
  } catch (e) {
    console.error("Update message error:", e);
    return error(res, "Ошибка сервера", 500);
  }
};

// Удаление сообщения
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Найти сообщение
    const message = await Message.findByPk(id);
    
    if (!message) {
      return error(res, "Сообщение не найдено", 404);
    }

    // Проверить, что пользователь является автором сообщения
    if (message.sender_id !== userId) {
      return error(res, "Нет прав для удаления этого сообщения", 403);
    }

    // Удалить сообщение
    await message.destroy();

    return success(res, null, "Сообщение удалено");
  } catch (e) {
    console.error("Delete message error:", e);
    return error(res, "Ошибка сервера", 500);
  }
};