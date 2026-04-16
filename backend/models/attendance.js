module.exports = (sequelize, DataTypes) => {
  const Attendance = sequelize.define(
    'Attendance',
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
      attendanceDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'date'
      },
      checkInAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'check_in'
      },
      checkOutAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'check_out'
      }
    },
    {
      tableName: 'attendance',
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ['user_id', 'date'],
          name: 'attendance_user_date_unique'
        }
      ]
    }
  );

  return Attendance;
};
