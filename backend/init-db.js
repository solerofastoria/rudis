const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function initDatabase() {
  try {
    console.log('🔄 Инициализация базы данных...');
    
    // Проверяем доступность PostgreSQL
    const { stdout } = await execAsync(
      'docker exec discord_clone_db psql -U postgres -d discord_clone -c "CREATE TABLE IF NOT EXISTS test_table (id SERIAL PRIMARY KEY, name VARCHAR(255));"'
    );
    
    console.log('✅ База данных готова к работе');
    console.log('Результат:', stdout);
  } catch (error) {
    console.error('❌ Ошибка инициализации БД:', error.message);
  }
}

initDatabase();