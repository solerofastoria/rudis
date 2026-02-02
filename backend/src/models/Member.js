module.exports = (sequelize, DataTypes) => {
  const Member = sequelize.define('Member', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: { 
      type: DataTypes.UUID, 
      allowNull: false 
    },
    server_id: { 
      type: DataTypes.UUID, 
      allowNull: false 
    },
    role: { 
      type: DataTypes.ENUM('owner', 'admin', 'moderator', 'member'), 
      defaultValue: 'member' 
    }
  }, {
    tableName: 'members',
    underscored: true,
    timestamps: true
  });

  Member.associate = (models) => {
    // Связь с пользователем
    Member.belongsTo(models.User, { 
      foreignKey: 'user_id', 
      as: 'user' 
    });
    
    // Связь с сервером
    Member.belongsTo(models.Server, { 
      foreignKey: 'server_id', 
      as: 'server' 
    });
  };

  return Member;
};