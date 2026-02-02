'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('channels', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('text', 'voice'),
        defaultValue: 'text'
      },
      server_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'servers',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      position: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Добавляем индекс для server_id
    await queryInterface.addIndex('channels', ['server_id'], {
      name: 'channels_server_id_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('channels');
  }
};