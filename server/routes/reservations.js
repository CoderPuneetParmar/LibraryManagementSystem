const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const authMiddleware = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnly');

router.post('/', authMiddleware, reservationController.createReservation);
router.get('/my', authMiddleware, reservationController.getMyReservations);
router.put('/:id/cancel', authMiddleware, reservationController.cancelReservation);
router.get('/queue', authMiddleware, adminOnly, reservationController.getReservationQueue);
router.put('/:id/fulfill', authMiddleware, adminOnly, reservationController.fulfillReservation);
router.post('/check-expiry', authMiddleware, adminOnly, reservationController.triggerExpiryCheck);

module.exports = router;
