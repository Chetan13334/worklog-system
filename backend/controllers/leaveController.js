const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const { Leave } = require('../models');
const { assertDateOnly } = require('../utils/date');

const createLeave = asyncHandler(async (req, res) => {
  const { startDate, endDate, leaveType, reason } = req.body;

  if (!startDate || !endDate || !leaveType || !reason) {
    throw new AppError('All leave fields are required.', 400);
  }

  const normalizedStartDate = assertDateOnly(String(startDate), 'start date');
  const normalizedEndDate = assertDateOnly(String(endDate), 'end date');

  if (normalizedEndDate < normalizedStartDate) {
    throw new AppError('End date cannot be before start date.', 400);
  }

  const leave = await Leave.create({
    userId: req.user.id,
    startDate: normalizedStartDate,
    endDate: normalizedEndDate,
    leaveType: String(leaveType).trim(),
    reason: String(reason).trim(),
    status: 'pending'
  });

  res.status(201).json({
    message: 'Leave request submitted successfully.',
    leave
  });
});

const getLeave = asyncHandler(async (req, res) => {
  const leaves = await Leave.findAll({
    where: {
      userId: req.user.id
    },
    order: [['id', 'DESC']]
  });

  res.json({
    records: leaves
  });
});

module.exports = {
  createLeave,
  getLeave
};
