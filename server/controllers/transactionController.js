const { Transaction, Book, User, Reservation } = require('../models');
const calculateFine = require('../utils/calculateFine');
const { promoteNextReservation } = require('../utils/reservationQueue');

// POST /api/transactions/issue (Admin only)
exports.issueBook = async (req, res) => {
  try {
    const { userId, bookId, dueDate } = req.body;

    if (!userId || !bookId) {
      return res.status(400).json({ message: 'User ID and Book ID are required.' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Member not found.' });
    }

    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    if (book.available_copies <= 0) {
      return res.status(400).json({ message: 'No available copies of this book to issue. Member should create a reservation.' });
    }

    const issueDate = new Date();
    const defaultDue = new Date(issueDate);
    defaultDue.setDate(issueDate.getDate() + 14); // 14 days default

    const finalDueDate = dueDate ? new Date(dueDate) : defaultDue;

    // Decrement available copies
    await book.decrement('available_copies');

    const transaction = await Transaction.create({
      user_id: user.id,
      book_id: book.id,
      issue_date: issueDate,
      due_date: finalDueDate,
      status: 'issued',
      fine_amount: 0.00,
      fine_paid: false,
      issued_by: req.user.id
    });

    const fullTransaction = await Transaction.findByPk(transaction.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'membership_id'] },
        { model: Book, as: 'book', attributes: ['id', 'title', 'author', 'isbn'] },
        { model: User, as: 'librarian', attributes: ['id', 'name'] }
      ]
    });

    return res.status(201).json(fullTransaction);
  } catch (error) {
    console.error('Error issuing book:', error);
    return res.status(500).json({ message: 'Server error issuing book.' });
  }
};

// PUT /api/transactions/:id/return (Admin only)
exports.returnBook = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id, {
      include: [
        { model: Book, as: 'book' },
        { model: User, as: 'user' }
      ]
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction record not found.' });
    }

    if (transaction.status === 'returned') {
      return res.status(400).json({ message: 'Book has already been returned.' });
    }

    const returnDate = new Date();
    const finalFine = calculateFine(transaction.due_date, returnDate);

    // Update transaction record
    await transaction.update({
      return_date: returnDate,
      status: 'returned',
      fine_amount: finalFine,
      fine_paid: finalFine === 0 ? true : false
    });

    // Increment available copies first
    await transaction.book.increment('available_copies');

    // Trigger promote next reservation check
    const promoted = await promoteNextReservation(transaction.book_id);
    if (promoted) {
      // Since copy is now held for ready reservation, decrement available_copies back
      await transaction.book.decrement('available_copies');
    }

    return res.json({
      message: 'Book returned successfully!',
      transaction: {
        ...transaction.toJSON(),
        fine_amount: finalFine,
        fine_paid: finalFine === 0
      },
      reservation_promoted: promoted ? true : false
    });
  } catch (error) {
    console.error('Error returning book:', error);
    return res.status(500).json({ message: 'Server error returning book.' });
  }
};

// GET /api/transactions/my (Logged in member)
exports.getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: Book, as: 'book', attributes: ['id', 'title', 'author', 'cover_image_url', 'isbn'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const result = transactions.map(t => {
      const item = t.toJSON();
      if (item.status === 'issued') {
        const liveFine = calculateFine(item.due_date, new Date());
        const isOverdue = new Date() > new Date(item.due_date);
        return {
          ...item,
          live_fine: liveFine,
          is_overdue: isOverdue
        };
      }
      return {
        ...item,
        live_fine: Number(item.fine_amount),
        is_overdue: false
      };
    });

    return res.json(result);
  } catch (error) {
    console.error('Error fetching member transactions:', error);
    return res.status(500).json({ message: 'Server error fetching transaction history.' });
  }
};

// GET /api/transactions (Admin only, filterable by ?status=)
exports.getAllTransactions = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) {
      where.status = status;
    }

    const transactions = await Transaction.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'membership_id', 'phone'] },
        { model: Book, as: 'book', attributes: ['id', 'title', 'author', 'isbn'] },
        { model: User, as: 'librarian', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const result = transactions.map(t => {
      const item = t.toJSON();
      if (item.status === 'issued') {
        const liveFine = calculateFine(item.due_date, new Date());
        const isOverdue = new Date() > new Date(item.due_date);
        return {
          ...item,
          live_fine: liveFine,
          is_overdue: isOverdue
        };
      }
      return {
        ...item,
        live_fine: Number(item.fine_amount),
        is_overdue: false
      };
    });

    return res.json(result);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ message: 'Server error fetching transactions.' });
  }
};
