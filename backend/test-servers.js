// Тестовый скрипт для проверки работы с серверами
const { sequelize, Server, Channel, Member, User } = require('./src/models');

async function testServers() {
  try {
    console.log('Подключение к базе данных...');
    await sequelize.authenticate();
    console.log('Подключение успешно установлено.');
    
    console.log('Синхронизация моделей...');
    await sequelize.sync({ alter: true });
    console.log('Модели синхронизированы.');
    
    // Создание тестового пользователя (если не существует)
    const [user, created] = await User.findOrCreate({
      where: { email: 'test@example.com' },
      defaults: {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      }
    });
    
    console.log('Тестовый пользователь:', user.username);
    
    // Создание тестового сервера
    const server = await Server.create({
      name: 'Тестовый сервер',
      owner_id: user.id,
      region: 'eu-west',
      privacy: 'public',
      template: 'default',
      invite_code: 'TEST123'
    });
    
    console.log('Создан сервер:', server.name);
    
    // Создание каналов
    const channels = await Channel.bulkCreate([
      { name: 'общение', type: 'text', server_id: server.id },
      { name: 'голосовой', type: 'voice', server_id: server.id },
      { name: 'новости', type: 'text', server_id: server.id }
    ]);
    
    console.log('Созданы каналы:', channels.map(c => c.name));
    
    // Добавление пользователя как участника
    const member = await Member.create({
      user_id: user.id,
      server_id: server.id,
      role: 'owner'
    });
    
    console.log('Участник добавлен:', member.role);
    
    // Получение сервера с каналами
    const serverWithChannels = await Server.findByPk(server.id, {
      include: [{
        model: Channel,
        as: 'channels'
      }]
    });
    
    console.log('Сервер с каналами:', {
      name: serverWithChannels.name,
      channels: serverWithChannels.Channels.map(c => c.name)
    });
    
    console.log('Тест успешно завершен!');
    
  } catch (error) {
    console.error('Ошибка в тесте:', error);
  } finally {
    await sequelize.close();
  }
}

testServers();