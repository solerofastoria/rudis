const { Sequelize } = require('sequelize');

async function finalTest() {
  console.log('🎯 ФИНАЛЬНЫЙ ТЕСТ ПОДКЛЮЧЕНИЯ');
  console.log('='.repeat(50));
  
  // Тест 1: Простое подключение
  console.log('1. Тестируем базовое подключение...');
  try {
    const sequelize = new Sequelize(
      'discord_clone',
      'postgres',
      'password',
      {
        host: 'localhost',
        port: 5432,
        dialect: 'postgres',
        logging: false
      }
    );

    await sequelize.authenticate();
    console.log('   ✅ Базовое подключение: УСПЕХ');
    
    // Тест 2: Запрос к тестовой таблице
    console.log('2. Тестируем запросы...');
    const [results] = await sequelize.query("SELECT * FROM test_connection");
    console.log('   ✅ Запрос к БД: УСПЕХ');
    console.log('   📋 Результат:', results[0].message);
    
    // Тест 3: Создаем таблицу пользователей
    console.log('3. Тестируем создание таблиц...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS users_test (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('   ✅ Создание таблиц: УСПЕХ');
    
    await sequelize.close();
    
    console.log('='.repeat(50));
    console.log('🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!');
    console.log('💡 Теперь можно запускать сервер: npm run dev');
    return true;
    
  } catch (error) {
    console.log('   ❌ ТЕСТ ПРОВАЛЕН:', error.message);
    console.log('='.repeat(50));
    console.log('🔧 Рекомендации:');
    console.log('   1. Проверь что контейнеры запущены: docker ps');
    console.log('   2. Проверь логи PostgreSQL: docker logs discord_clone_db');
    console.log('   3. Попробуй пересоздать контейнеры: npm run db:reset');
    return false;
  }
}

finalTest();