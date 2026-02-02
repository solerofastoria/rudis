module.exports = (sequelize, DataTypes) => {
  const Server = sequelize.define('Server', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    icon_url: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    invite_code: { 
      type: DataTypes.STRING, 
      allowNull: false,
      unique: true
    },
    owner_id: { 
      type: DataTypes.UUID, 
      allowNull: false 
    },
    region: { 
      type: DataTypes.ENUM('eu-west', 'us-east', 'asia-pacific'), 
      defaultValue: 'eu-west' 
    },
    privacy: { 
      type: DataTypes.ENUM('public', 'private'), 
      defaultValue: 'public' 
    },
    template: { 
      type: DataTypes.ENUM('default', 'gaming', 'study', 'friends'), 
      defaultValue: 'default' 
    }
  }, {
    tableName: 'servers',
    timestamps: true,
    underscored: true
  });

  Server.associate = (models) => {
    // Связь с владельцем (пользователем)
    Server.belongsTo(models.User, { 
      foreignKey: 'owner_id', 
      as: 'owner' 
    });
    
    // Связь с каналами
    Server.hasMany(models.Channel, { 
      foreignKey: 'server_id', 
      as: 'channels' 
    });
    
    // Связь с участниками
    Server.hasMany(models.Member, { 
      foreignKey: 'server_id', 
      as: 'members' 
    });
  };

  return Server;
};