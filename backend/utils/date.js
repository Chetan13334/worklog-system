const AppError = require('./appError');

const DEFAULT_TIME_ZONE = process.env.APP_TIME_ZONE || 'Asia/Kolkata';

function formatDateOnly(value = new Date(), timeZone = DEFAULT_TIME_ZONE) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(value));
}

function getTodayDateOnly() {
  return formatDateOnly(new Date());
}

function assertDateOnly(dateValue, label) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    throw new AppError(`Invalid ${label}. Use YYYY-MM-DD format.`, 400);
  }
  return dateValue;
}

function getMonthRange(monthValue) {
  if (!/^\d{4}-\d{2}$/.test(monthValue)) {
    throw new AppError('Invalid month. Use YYYY-MM format.', 400);
  }

  const [year, month] = monthValue.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return {
    start: `${monthValue}-01`,
    end: `${monthValue}-${String(lastDay).padStart(2, '0')}`
  };
}

function calculateHours(startAt, endAt) {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const hours = (end.getTime() - start.getTime()) / 36e5;
  return Number(Math.max(hours, 0).toFixed(2));
}

module.exports = {
  assertDateOnly,
  calculateHours,
  formatDateOnly,
  getMonthRange,
  getTodayDateOnly
};
