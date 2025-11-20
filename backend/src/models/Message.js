const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  // Для личных сообщений
  isDirect: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // ID получателя для личных сообщений
  recipientId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  // ID отправителя
  senderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  // Флаг редактирования
  isEdited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Время последнего редактирования
  editedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Время создания
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'messages',
  indexes: [
    {
      fields: ['senderId']
    },
    {
      fields: ['recipientId']
    },
    {
      fields: ['createdAt']
    }
  ]
});

// Связи
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'recipient', foreignKey: 'recipientId' });

module.exports = Message;
