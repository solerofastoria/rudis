'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Добавляем внешние ключи для таблицы messages
    await queryInterface.addConstraint('messages', {
      fields: ['senderId'],
      type: 'foreign key',
      name: 'messages_senderId_fkey',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('messages', {
      fields: ['recipientId'],
      type: 'foreign key',
      name: 'messages_recipientId_fkey',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    // Удаляем внешние ключи
    await queryInterface.removeConstraint('messages', 'messages_senderId_fkey');
    await queryInterface.removeConstraint('messages', 'messages_recipientId_fkey');
  }
};