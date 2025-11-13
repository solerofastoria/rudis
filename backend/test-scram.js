const { Client } = require('pg');

async function testScramConnection() {
  console.log('🧪 Тестируем SCRAM-SHA-256 подключение...');
  
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'discord_clone',
    user: 'postgres',
    password: 'password',
    ssl: false
  });

  try {
    await client.connect();
    console.log('✅ SCRAM-SHA-256 подключение УСПЕШНО!');
    
    const result = await client.query('SELECT version() as version');
    console.log('✅ Версия PostgreSQL:', result.rows[0].version);
    
    await client.end();
    return true;
  } catch (error) {
    console.error('❌ SCRAM-SHA-256 подключение НЕ УДАЛОСЬ:');
    console.error('   Ошибка:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.error('   💡 Проблема с паролем');
      console.error('   💡 Проверь что в .env и docker-compose.yml одинаковые пароли');
    }
    
    return false;
  }
}

testScramConnection();