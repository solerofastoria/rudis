// backend/test-db-connection.js
const { sequelize, testConnection } = require('./src/config/database');

(async () => {
  try {
    await testConnection();
    console.log('✅ Подключение к базе данных успешно установлено');
    
    // Проверяем наличие таблиц
    const tables = await sequelize.getQueryInterface().showAllSchemas();
    console.log('📋 Доступные схемы:', tables.map(t => t.name || t));
    
    // Получаем список таблиц в текущей схеме
    const tableNames = await sequelize.getQueryInterface().showAllTables();
    console.log('📋 Таблицы в базе данных:', tableNames);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:', error.message);
    process.exit(1);
  }
})();