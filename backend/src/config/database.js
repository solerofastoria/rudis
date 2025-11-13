const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('🔧 Настройки БД:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD ? '***' : 'MISSING'
});

// Создаем подключение с явным указанием диалекта
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectModule: require('pg'),
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      ssl: false,
      // Явно указываем использование нового драйвера
      connectionString: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Тестовое подключение
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL подключена успешно');
    
    // Создаем тестовую таблицу
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS test_connection (
          id SERIAL PRIMARY KEY,
          message TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      // Проверяем/добавляем тестовые данные
      const [results] = await sequelize.query("SELECT * FROM test_connection");
      if (results.length === 0) {
        await sequelize.query("INSERT INTO test_connection (message) VALUES ('База данных работает с SCRAM-SHA-256!')");
      }
      
      console.log('✅ Тестовая таблица готова');
    } catch (tableError) {
      console.log('⚠️  Таблица уже существует');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка подключения к PostgreSQL:');
    console.error('   Сообщение:', error.message);
    console.error('   Код ошибки:', error.original?.code);
    
    if (error.original?.code === '28P01') {
      console.error('   💡 Проблема с SCRAM-SHA-256 аутентификацией');
      console.error('   💡 Решение:');
      console.error('      1. Убедись что пароль в .env совпадает с docker-compose.yml');
      console.error('      2. Попробуй: npm run db:reset');
      console.error('      3. Проверь версию pg: npm list pg');
    }
    
    throw error;
  }
};

module.exports = { sequelize, testConnection };