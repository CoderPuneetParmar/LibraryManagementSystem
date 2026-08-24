const express = require('express');
const router = express.Router();
const ebookController = require('../controllers/ebookController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', ebookController.getAllEbooks);
router.get('/:id', ebookController.getEbookById);

module.exports = router;
