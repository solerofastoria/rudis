require('dotenv').config({ path: './backend/.env' });

const { sequelize, Server, Channel } = require('./backend/src/models');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('DB Config:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USER
    });
    
    // Test basic connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Test querying servers
    const servers = await Server.findAll({ limit: 1 });
    console.log(`✅ Servers table accessible, found ${servers.length} records`);
    
    // Test querying channels
    const channels = await Channel.findAll({ limit: 1 });
    console.log(`✅ Channels table accessible, found ${channels.length} records`);
    
    console.log('✅ All tests passed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Code:', error.original?.code);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testConnection();