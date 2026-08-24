const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnly');

router.get('/dashboard', authMiddleware, adminOnly, analyticsController.getDashboardAnalytics);

module.exports = router;
