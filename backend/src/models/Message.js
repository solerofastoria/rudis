module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    content: { type: DataTypes.TEXT, allowNull: false },
    is_direct: { type: DataTypes.BOOLEAN, defaultValue: false },
    recipient_id: { type: DataTypes.UUID, allowNull: true },
    sender_id: { type: DataTypes.UUID, allowNull: false },
    is_edited: { type: DataTypes.BOOLEAN, defaultValue: false },
    edited_at: { type: DataTypes.DATE, allowNull: true },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    tableName: 'messages',
    underscored: true,
    timestamps: true
  });

  Message.associate = (models) => {
    Message.belongsTo(models.User, { foreignKey: 'sender_id', as: 'sender' });
    Message.belongsTo(models.User, { foreignKey: 'recipient_id', as: 'recipient' });
  };

  return Message;
};
