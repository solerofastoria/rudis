const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 30],
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 100]
    }
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  status: {
    type: DataTypes.ENUM('online', 'offline', 'idle', 'dnd'),
    defaultValue: 'offline'
  },
  online: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  lastSeen: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
});

// Метод для проверки пароля
User.prototype.checkPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Метод для безопасного возврата пользователя (без пароля)
User.prototype.toSafeObject = function() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;