'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('servers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      icon_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      invite_code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      owner_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      region: {
        type: Sequelize.ENUM('eu-west', 'us-east', 'asia-pacific'),
        defaultValue: 'eu-west'
      },
      privacy: {
        type: Sequelize.ENUM('public', 'private'),
        defaultValue: 'public'
      },
      template: {
        type: Sequelize.ENUM('default', 'gaming', 'study', 'friends'),
        defaultValue: 'default'
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

    // Добавляем индекс для owner_id
    await queryInterface.addIndex('servers', ['owner_id'], {
      name: 'servers_owner_id_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('servers');
  }
};