const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createLeave, getLeave } = require('../controllers/leaveController');

router.post('/leave', authMiddleware, createLeave);
router.get('/leave', authMiddleware, getLeave);

module.exports = router;
