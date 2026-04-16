module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define(
    'Session',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id'
      },
      tokenId: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
        field: 'token_id'
      },
      lastActivityAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'last_activity_at'
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'expires_at'
      },
      revokedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'revoked_at'
      }
    },
    {
      tableName: 'sessions',
      timestamps: true
    }
  );

  return Session;
};
