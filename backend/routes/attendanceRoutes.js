const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  checkIn,
  checkOut,
  getAttendance,
  getTodayAttendance
} = require('../controllers/attendanceController');

router.post('/checkin', authMiddleware, checkIn);
router.post('/checkout', authMiddleware, checkOut);
router.get('/attendance/today', authMiddleware, getTodayAttendance);
router.get('/attendance', authMiddleware, getAttendance);

module.exports = router;
