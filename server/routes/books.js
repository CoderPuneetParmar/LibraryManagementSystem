const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnly');

router.get('/', bookController.getAllBooks);
router.get('/:id', bookController.getBookById);
router.post('/', authMiddleware, adminOnly, bookController.createBook);
router.put('/:id', authMiddleware, adminOnly, bookController.updateBook);
router.delete('/:id', authMiddleware, adminOnly, bookController.deleteBook);

module.exports = router;
