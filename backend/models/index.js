const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = require('./user')(sequelize, DataTypes);
const Attendance = require('./attendance')(sequelize, DataTypes);
const Leave = require('./leave')(sequelize, DataTypes);
const Session = require('./session')(sequelize, DataTypes);

User.hasMany(Attendance, {
  foreignKey: 'userId',
  as: 'attendanceRecords',
  onDelete: 'CASCADE'
});

Attendance.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

User.hasMany(Leave, {
  foreignKey: 'userId',
  as: 'leaveRequests',
  onDelete: 'CASCADE'
});

Leave.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

User.hasMany(Session, {
  foreignKey: 'userId',
  as: 'sessions',
  onDelete: 'CASCADE'
});

Session.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

module.exports = {
  sequelize,
  Sequelize,
  User,
  Attendance,
  Leave,
  Session
};
