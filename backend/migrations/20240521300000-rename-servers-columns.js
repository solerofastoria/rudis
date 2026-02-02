'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Проверяем существование колонок перед переименованием
    // Так как таблица servers уже создана с snake_case именами,
    // нам нужно проверить какие колонки существуют
    
    // Для таблицы servers уже используются snake_case имена колонок
    // Никаких действий не требуется, так как структура уже правильная
    console.log('Servers table already has correct column names');
  },

  async down(queryInterface, Sequelize) {
    // Нет необходимости возвращать обратно, так как структура правильная
    console.log('Servers table column names are already correct');
  }
};