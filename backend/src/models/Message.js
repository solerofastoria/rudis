module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    content: { type: DataTypes.TEXT, allowNull: false },
    isDirect: { type: DataTypes.BOOLEAN, defaultValue: false },
    recipientId: { type: DataTypes.UUID, allowNull: true },
    senderId: { type: DataTypes.UUID, allowNull: false },
    isEdited: { type: DataTypes.BOOLEAN, defaultValue: false },
    editedAt: { type: DataTypes.DATE, allowNull: true },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    tableName: 'messages',
    timestamps: true
  });

  Message.associate = (models) => {
    Message.belongsTo(models.User, { foreignKey: 'senderId', as: 'sender' });
    Message.belongsTo(models.User, { foreignKey: 'recipientId', as: 'recipient' });
  };

  return Message;
};
