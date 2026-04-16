module.exports = (sequelize, DataTypes) => {
  const Leave = sequelize.define(
    'Leave',
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
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'start_date'
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'end_date'
      },
      leaveType: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'leave_type'
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
      }
    },
    {
      tableName: 'leaves',
      timestamps: false
    }
  );

  return Leave;
};
