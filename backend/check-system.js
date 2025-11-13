const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function checkSystem() {
  console.log('🔍 Проверка системы...\n');

  try {
    // Проверяем Docker
    console.log('1. Проверка Docker...');
    const { stdout: dockerStdout } = await execAsync('docker --version');
    console.log('   ✅', dockerStdout.trim());

    // Проверяем контейнеры
    console.log('2. Проверка контейнеров...');
    const { stdout: containersStdout } = await execAsync('docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"');
    console.log(containersStdout);

    // Проверяем PostgreSQL
    console.log('3. Проверка PostgreSQL...');
    try {
      const { stdout: postgresStdout } = await execAsync('docker exec discord_clone_db psql -U postgres -d discord_clone -c "SELECT version();"');
      console.log('   ✅ PostgreSQL работает:', postgresStdout.split('\n')[2]);
    } catch (error) {
      console.log('   ❌ PostgreSQL не доступен');
      console.log('   💡 Запустите: npm run db:start');
    }

    console.log('\n🎯 Рекомендации:');
    console.log('   - Если контейнеров нет: npm run db:start');
    console.log('   - Если контейнеры есть но БД не работает: npm run db:reset');
    
  } catch (error) {
    console.error('❌ Ошибка проверки системы:', error.message);
  }
}

checkSystem();