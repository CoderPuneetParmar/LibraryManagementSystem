const express = require('express');
const router = express.Router();
const fineController = require('../controllers/fineController');
const authMiddleware = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnly');

router.get('/overdue', authMiddleware, adminOnly, fineController.getOverdueFines);
router.put('/:transactionId/pay', authMiddleware, fineController.payFine);

module.exports = router;
