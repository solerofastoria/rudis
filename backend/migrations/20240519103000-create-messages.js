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
      is_direct: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      sender_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      recipient_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      is_edited: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      edited_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("messages");
  },
};
