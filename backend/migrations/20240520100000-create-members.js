'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('members', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
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
      role: {
        type: Sequelize.ENUM('owner', 'admin', 'moderator', 'member'),
        defaultValue: 'member'
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

    // Добавляем уникальный индекс для user_id и server_id
    await queryInterface.addIndex('members', ['user_id', 'server_id'], {
      unique: true,
      name: 'members_user_server_unique'
    });

    // Добавляем индексы для быстрого поиска
    await queryInterface.addIndex('members', ['user_id'], {
      name: 'members_user_id_index'
    });

    await queryInterface.addIndex('members', ['server_id'], {
      name: 'members_server_id_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('members');
  }
};