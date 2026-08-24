const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnly');

router.post('/issue', authMiddleware, adminOnly, transactionController.issueBook);
router.put('/:id/return', authMiddleware, adminOnly, transactionController.returnBook);
router.get('/my', authMiddleware, transactionController.getMyTransactions);
router.get('/', authMiddleware, adminOnly, transactionController.getAllTransactions);

module.exports = router;
