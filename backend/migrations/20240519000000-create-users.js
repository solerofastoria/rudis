'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      avatar: {
        type: Sequelize.STRING,
        defaultValue: null
      },
      status: {
        type: Sequelize.ENUM('online', 'offline', 'idle', 'dnd'),
        defaultValue: 'offline'
      },
      online: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      lastSeen: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("users");
  },
};
