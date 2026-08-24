const { Reservation, Book, User, Transaction } = require('../models');
const { Op } = require('sequelize');
const { promoteNextReservation } = require('../utils/reservationQueue');
const { checkExpiredReservations } = require('../jobs/expireReservations');

// POST /api/reservations - Member creates reservation
exports.createReservation = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    if (!bookId) {
      return res.status(400).json({ message: 'Book ID is required.' });
    }

    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    // Check if user already has active reservation for this book
    const existing = await Reservation.findOne({
      where: {
        user_id: userId,
        book_id: bookId,
        status: { [Op.in]: ['waiting', 'ready'] }
      }
    });

    if (existing) {
      return res.status(400).json({ message: 'You already have an active reservation for this book.' });
    }

    // Calculate queue position
    const lastInQueue = await Reservation.findOne({
      where: { book_id: bookId, status: 'waiting' },
      order: [['queue_position', 'DESC']]
    });

    const nextPosition = lastInQueue ? lastInQueue.queue_position + 1 : 1;

    let status = 'waiting';
    let readyDate = null;
    let expiryDate = null;

    // If copies are available, can immediately mark 'ready'
    if (book.available_copies > 0) {
      status = 'ready';
      readyDate = new Date();
      expiryDate = new Date();
      expiryDate.setDate(readyDate.getDate() + 3);

      await book.decrement('available_copies');
    }

    const reservation = await Reservation.create({
      user_id: userId,
      book_id: bookId,
      reservation_date: new Date(),
      ready_date: readyDate,
      expiry_date: expiryDate,
      status: status,
      queue_position: nextPosition
    });

    const fullResv = await Reservation.findByPk(reservation.id, {
      include: [
        { model: Book, as: 'book', attributes: ['id', 'title', 'author', 'cover_image_url'] }
      ]
    });

    return res.status(201).json(fullResv);
  } catch (error) {
    console.error('Error creating reservation:', error);
    return res.status(500).json({ message: 'Server error creating reservation.' });
  }
};

// GET /api/reservations/my - Member's own reservations
exports.getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: Book, as: 'book', attributes: ['id', 'title', 'author', 'cover_image_url', 'isbn'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.json(reservations);
  } catch (error) {
    console.error('Error fetching my reservations:', error);
    return res.status(500).json({ message: 'Server error fetching reservations.' });
  }
};

// PUT /api/reservations/:id/cancel - Member or Admin cancels reservation
exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id, {
      include: [{ model: Book, as: 'book' }]
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found.' });
    }

    if (req.user.role !== 'admin' && reservation.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this reservation.' });
    }

    if (reservation.status === 'cancelled' || reservation.status === 'fulfilled' || reservation.status === 'expired') {
      return res.status(400).json({ message: `Cannot cancel a reservation that is already ${reservation.status}.` });
    }

    const wasReady = reservation.status === 'ready';

    await reservation.update({ status: 'cancelled' });

    // If it was ready, promote next in queue or return copy to available
    if (wasReady) {
      const promoted = await promoteNextReservation(reservation.book_id);
      if (!promoted) {
        await reservation.book.increment('available_copies');
      }
    }

    return res.json({ message: 'Reservation cancelled successfully.', reservation });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    return res.status(500).json({ message: 'Server error cancelling reservation.' });
  }
};

// GET /api/reservations/queue - Admin view active reservations
exports.getReservationQueue = async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'membership_id', 'phone'] },
        { model: Book, as: 'book', attributes: ['id', 'title', 'author', 'isbn', 'available_copies'] }
      ],
      order: [
        ['book_id', 'ASC'],
        ['queue_position', 'ASC']
      ]
    });

    return res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservation queue:', error);
    return res.status(500).json({ message: 'Server error fetching reservation queue.' });
  }
};

// PUT /api/reservations/:id/fulfill - Admin converts 'ready' reservation to issued transaction
exports.fulfillReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id, {
      include: [{ model: Book, as: 'book' }]
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found.' });
    }

    if (reservation.status !== 'ready') {
      return res.status(400).json({ message: 'Only reservations with status "ready" can be fulfilled.' });
    }

    const issueDate = new Date();
    const dueDate = new Date(issueDate);
    dueDate.setDate(issueDate.getDate() + 14);

    // Create transaction
    const transaction = await Transaction.create({
      user_id: reservation.user_id,
      book_id: reservation.book_id,
      issue_date: issueDate,
      due_date: dueDate,
      status: 'issued',
      fine_amount: 0.00,
      fine_paid: false,
      issued_by: req.user.id
    });

    // Update reservation status
    await reservation.update({ status: 'fulfilled' });

    return res.json({
      message: 'Reservation fulfilled successfully! Book issued to member.',
      transaction,
      reservation
    });
  } catch (error) {
    console.error('Error fulfilling reservation:', error);
    return res.status(500).json({ message: 'Server error fulfilling reservation.' });
  }
};

// POST /api/reservations/check-expiry - Manual trigger for testing & demo
exports.triggerExpiryCheck = async (req, res) => {
  try {
    const summary = await checkExpiredReservations();
    return res.json({
      message: 'Reservation expiry check completed successfully.',
      summary
    });
  } catch (error) {
    console.error('Error executing expiry check:', error);
    return res.status(500).json({ message: 'Server error executing expiry check.' });
  }
};
