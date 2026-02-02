const http = require('http');

// Тестовые данные для создания сервера
const testData = {
  name: 'Тестовый сервер',
  region: 'eu-west',
  privacy: 'public',
  template: 'default'
};

// Опции запроса
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/servers/create',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your_jwt_token_here' // Замените на настоящий токен
  }
};

// Создаем запрос
const req = http.request(options, (res) => {
  let data = '';
  
  // Получаем данные
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  // Обрабатываем завершение запроса
  res.on('end', () => {
    console.log(`Статус: ${res.statusCode}`);
    console.log(`Ответ: ${data}`);
    
    if (res.statusCode === 201) {
      console.log('✅ Сервер успешно создан!');
      try {
        const result = JSON.parse(data);
        console.log('Созданный сервер:', result.server);
      } catch (e) {
        console.log('Ответ:', data);
      }
    } else {
      console.log('❌ Ошибка при создании сервера');
    }
  });
});

// Обрабатываем ошибки
req.on('error', (error) => {
  console.error('Ошибка запроса:', error.message);
});

// Отправляем данные
req.write(JSON.stringify(testData));
req.end();

console.log('Отправка запроса на создание сервера...');
console.log('URL: http://localhost:5000/api/servers/create');
console.log('Данные:', testData);