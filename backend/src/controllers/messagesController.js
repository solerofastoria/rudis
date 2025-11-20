const Message = require("../models/Message");
const User = require("../models/User");
const { success, error } = require("../utils/response");

// Получение всех сообщений (публичных)
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: {
        isDirect: false
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'avatar']
        }
      ],
      order: [['createdAt', 'ASC']],
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
        isDirect: true,
        [require('sequelize').Op.or]: [
          {
            [require('sequelize').Op.and]: [
              { senderId: currentUserId },
              { recipientId: userId }
            ]
          },
          {
            [require('sequelize').Op.and]: [
              { senderId: userId },
              { recipientId: currentUserId }
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
      order: [['createdAt', 'ASC']],
      limit: 100
    });

    return success(res, messages);
  } catch (e) {
    console.error("Get direct messages error:", e);
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
      senderId,
      recipientId: isDirect ? recipientId : null,
      isDirect: isDirect || false
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
    if (message.senderId !== userId) {
      return error(res, "Нет прав для редактирования этого сообщения", 403);
    }

    // Обновить сообщение
    message.content = content.trim();
    message.isEdited = true;
    message.editedAt = new Date();
    
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
    if (message.senderId !== userId) {
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