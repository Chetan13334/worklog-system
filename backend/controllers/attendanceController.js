const { Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const { Attendance } = require('../models');
const {
  calculateHours,
  getMonthRange,
  getTodayDateOnly,
  assertDateOnly
} = require('../utils/date');

const getTodayAttendance = asyncHandler(async (req, res) => {
  const today = getTodayDateOnly();
  const attendance = await Attendance.findOne({
    where: {
      userId: req.user.id,
      attendanceDate: today
    }
  });

  const status = !attendance
    ? 'not_checked_in'
    : attendance.checkOutAt
      ? 'checked_out'
      : 'checked_in';

  res.json({
    status,
    attendance: attendance
      ? {
          ...attendance.toJSON(),
          totalHours: attendance.checkOutAt
            ? calculateHours(attendance.checkInAt, attendance.checkOutAt)
            : 0
        }
      : null
  });
});

const checkIn = asyncHandler(async (req, res) => {
  const today = getTodayDateOnly();
  const existing = await Attendance.findOne({
    where: {
      userId: req.user.id,
      attendanceDate: today
    }
  });

  if (existing) {
    throw new AppError('You have already checked in for today.', 400);
  }

  const now = new Date();
  const attendance = await Attendance.create({
    userId: req.user.id,
    attendanceDate: today,
    checkInAt: now,
    checkOutAt: null
  });

  res.status(201).json({
    message: 'Check-in recorded successfully.',
    attendance: {
      ...attendance.toJSON(),
      status: 'checked_in',
      totalHours: 0
    }
  });
});

const checkOut = asyncHandler(async (req, res) => {
  const today = getTodayDateOnly();
  const attendance = await Attendance.findOne({
    where: {
      userId: req.user.id,
      attendanceDate: today
    }
  });

  if (!attendance) {
    throw new AppError('Check in first before checking out.', 400);
  }

  if (attendance.checkOutAt) {
    throw new AppError('You have already checked out for today.', 400);
  }

  const now = new Date();
  const checkOutAt = now;
  attendance.checkOutAt = checkOutAt;
  await attendance.save();

  res.json({
    message: 'Check-out recorded successfully.',
    attendance: {
      ...attendance.toJSON(),
      totalHours: calculateHours(attendance.checkInAt, checkOutAt),
      status: 'checked_out'
    }
  });
});

const getAttendance = asyncHandler(async (req, res) => {
  const { month, from, to } = req.query;
  const where = {
    userId: req.user.id
  };

  if (month) {
    const range = getMonthRange(String(month));
    where.attendanceDate = {
      [Op.between]: [range.start, range.end]
    };
  } else if (from || to) {
    const startDate = from ? assertDateOnly(String(from), 'from date') : '0000-01-01';
    const endDate = to ? assertDateOnly(String(to), 'to date') : '9999-12-31';
    where.attendanceDate = {
      [Op.between]: [startDate, endDate]
    };
  }

  const attendance = await Attendance.findAll({
    where,
    order: [['attendanceDate', 'DESC'], ['checkInAt', 'DESC']]
  });

  res.json({
    records: attendance.map((record) => ({
      ...record.toJSON(),
      totalHours: record.checkOutAt
        ? calculateHours(record.checkInAt, record.checkOutAt)
        : 0,
      status: record.checkOutAt ? 'checked_out' : 'checked_in'
    }))
  });
});

module.exports = {
  checkIn,
  checkOut,
  getAttendance,
  getTodayAttendance
};
