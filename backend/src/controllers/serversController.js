const { Server, Channel, Member } = require("../models");
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;

// Генерация уникального кода приглашения
const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Создание сервера
exports.createServer = async (req, res) => {
  try {
    const { name, template = 'default', region = 'eu-west', privacy = 'public' } = req.body;
    const userId = req.user.id;
    
    // Валидация
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NAME_TOO_SHORT',
          message: 'Название должно содержать минимум 2 символа'
        }
      });
    }
    
    if (name.length > 100) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NAME_TOO_LONG',
          message: 'Название не должно превышать 100 символов'
        }
      });
    }
    
    // Проверка уникальности названия для текущего пользователя
    const existingServer = await Server.findOne({
      where: { name: name.trim(), owner_id: userId }
    });
    
    if (existingServer) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NAME_TAKEN',
          message: 'У вас уже есть сервер с таким названием',
          field: 'name'
        }
      });
    }
    
    // Создание сервера
    const server = await Server.create({
      name: name.trim(),
      owner_id: userId,
      region,
      privacy,
      template,
      invite_code: generateInviteCode()
    });
    
    // Создание стандартных каналов в зависимости от шаблона
    let defaultChannels = [];
    
    switch (template) {
      case 'gaming':
        defaultChannels = [
          { name: 'основной', type: 'text' },
          { name: 'голосовой', type: 'voice' },
          { name: 'лfg', type: 'text' }
        ];
        break;
      case 'study':
        defaultChannels = [
          { name: 'общение', type: 'text' },
          { name: 'домашки', type: 'text' },
          { name: 'вопросы', type: 'text' }
        ];
        break;
      case 'friends':
        defaultChannels = [
          { name: 'чат', type: 'text' },
          { name: 'голосовой', type: 'voice' },
          { name: 'медиа', type: 'text' }
        ];
        break;
      default: // default template
        defaultChannels = [
          { name: 'общение', type: 'text' },
          { name: 'голосовой', type: 'voice' }
        ];
    }
    
    // Добавляем server_id к каждому каналу
    const channelsWithServerId = defaultChannels.map(channel => ({
      ...channel,
      server_id: server.id
    }));
    
    // Создаем каналы
    const createdChannels = await Channel.bulkCreate(channelsWithServerId);
    
    // Добавление владельца как участника
    await Member.create({
      user_id: userId,
      server_id: server.id,
      role: 'owner'
    });
    
    // Обработка иконки если есть
    let iconUrl = null;
    if (req.file) {
      // Проверка размера файла (5MB)
      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ICON_TOO_LARGE',
            message: 'Размер иконки не должен превышать 5MB'
          }
        });
      }
      
      // Проверка типа файла
      const allowedTypes = ['image/png', 'image/jpeg', 'image/gif'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ICON_INVALID_FORMAT',
            message: 'Поддерживаются только PNG, JPG, JPEG, GIF'
          }
        });
      }
      
      // В реальном приложении здесь будет загрузка в хранилище
      // Для демонстрации просто сохраняем URL файла
      iconUrl = `/uploads/${req.file.filename}`;
      await server.update({ icon_url: iconUrl });
    }
    
    // Формируем ответ
    const serverResponse = {
      id: server.id,
      name: server.name,
      icon_url: server.icon_url,
      invite_code: server.invite_code,
      owner_id: server.owner_id,
      created_at: server.created_at,
      channels: createdChannels.map(channel => ({
        id: channel.id,
        name: channel.name,
        type: channel.type
      }))
    };
    // Отправляем событие через сокет
    const { io } = require('../app'); // Получаем io из app.js
    if (io) {
      // Отправляем событие всем подключенным клиентам
      io.emit('server:created', {
        serverId: server.id,
        name: server.name,
        ownerId: userId
      });
    }
    
    return res.status(201).json({
      success: true,
      server: serverResponse
    });
    
  } catch (error) {
    console.error('Server creation error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Ошибка при создании сервера'
      }
    });
  }
};

// Получение списка серверов пользователя
exports.getUserServers = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const servers = await Server.findAll({
      where: { owner_id: userId },
      include: [{
        model: Channel,
        as: 'channels',
        attributes: ['id', 'name', 'type']
      }],
      order: [['created_at', 'DESC']]
    });
    
    const serversResponse = servers.map(server => ({
      id: server.id,
      name: server.name,
      icon_url: server.icon_url,
      invite_code: server.invite_code,
      owner_id: server.owner_id,
      created_at: server.created_at,
      channels: server.Channels.map(channel => ({
        id: channel.id,
        name: channel.name,
        type: channel.type
      }))
    }));
    
    return res.json({
      success: true,
      servers: serversResponse
    });
  } catch (error) {
    console.error('Error fetching user servers:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Ошибка при получении списка серверов'
      }
    });
  }
};

// Получение информации о сервере
exports.getServer = async (req, res) => {
  try {
    const { serverId } = req.params;
    const userId = req.user.id;
    
    // Проверяем, что пользователь является участником сервера
    const member = await Member.findOne({
      where: { server_id: serverId, user_id: userId }
    });
    
    if (!member) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'У вас нет доступа к этому серверу'
        }
      });
    }
    
    const server = await Server.findByPk(serverId, {
      include: [{
        model: Channel,
        as: 'channels',
        attributes: ['id', 'name', 'type']
      }]
    });
    
    if (!server) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SERVER_NOT_FOUND',
          message: 'Сервер не найден'
        }
      });
    }
    
    const serverResponse = {
      id: server.id,
      name: server.name,
      icon_url: server.icon_url,
      invite_code: server.invite_code,
      owner_id: server.owner_id,
      created_at: server.created_at,
      channels: server.Channels.map(channel => ({
        id: channel.id,
        name: channel.name,
        type: channel.type
      }))
    };
    
    return res.json({
      success: true,
      server: serverResponse
    });
  } catch (error) {
    console.error('Error fetching server:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Ошибка при получении информации о сервере'
      }
    });
  }
};