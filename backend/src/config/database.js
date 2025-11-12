const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    retry: {
      max: 3,
      timeout: 3000
    }
  }
);

// Тестовое подключение
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL подключена успешно');
    return true;
  } catch (error) {
    console.error('Ошибка подключения к PostgreSQL:', error.message);
    throw error;
  }
};

module.exports = { sequelize, testConnection };