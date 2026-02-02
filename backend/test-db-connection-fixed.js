const { Sequelize } = require('sequelize');

async function testConnection() {
  console.log('🧪 Тестируем прямое подключение к PostgreSQL...');
  
  try {
    const sequelize = new Sequelize(
      'rudis',
      'postgres', 
      'password',
      {
        host: 'localhost',
        port: 5432,
        dialect: 'postgres',
        logging: console.log
      }
    );

    await sequelize.authenticate();
    console.log('✅ Прямое подключение УСПЕШНО!');
    
    // Создадим тестовую таблицу
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS users_test (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Тестовая таблица создана');
    
    await sequelize.close();
    return true;
  } catch (error) {
    console.error('❌ Прямое подключение НЕ УДАЛОСЬ:');
    console.error('   Ошибка:', error.message);
    console.error('   Код:', error.original?.code);
    
    console.log('\n💡 Проверь:');
    console.log('   1. Контейнер запущен: docker ps');
    console.log('   2. Можно подключиться через командную строку:');
    console.log('      docker exec -it discord_clone_db psql -U postgres -d rudis -c "SELECT version();"');
    
    return false;
  }
}

testConnection();