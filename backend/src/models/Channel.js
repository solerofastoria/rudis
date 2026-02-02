module.exports = (sequelize, DataTypes) => {
  const Channel = sequelize.define('Channel', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    type: { 
      type: DataTypes.ENUM('text', 'voice'), 
      defaultValue: 'text' 
    },
    server_id: { 
      type: DataTypes.UUID, 
      allowNull: false 
    }
  }, {
    tableName: 'channels',
    underscored: true,
    timestamps: true
  });

  Channel.associate = (models) => {
    // Связь с сервером
    Channel.belongsTo(models.Server, { 
      foreignKey: 'server_id', 
      as: 'server' 
    });
  };

  return Channel;
};