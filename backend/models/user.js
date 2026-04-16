module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      username: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      fullName: {
        type: DataTypes.STRING(150),
        allowNull: true,
        field: 'full_name'
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: true,
        unique: true
      },
      department: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      designation: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      role: {
        type: DataTypes.STRING(30),
        allowNull: true,
        defaultValue: 'employee'
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
        field: 'is_active'
      }
    },
    {
      tableName: 'users',
      timestamps: false
    }
  );

  return User;
};
