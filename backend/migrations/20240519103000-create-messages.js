'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("messages", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      isDirect: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      senderId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      recipientId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      isEdited: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      editedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("messages");
  },
};
