const { Transaction, User, Book } = require('../models');
const { Op } = require('sequelize');
const calculateFine = require('../utils/calculateFine');

// GET /api/fines/overdue (Admin only)
exports.getOverdueFines = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: {
        fine_paid: false
      },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'membership_id', 'phone'] },
        { model: Book, as: 'book', attributes: ['id', 'title', 'author', 'isbn'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const finesList = transactions.map(t => {
      const item = t.toJSON();
      let fineAmount = Number(item.fine_amount);
      if (item.status === 'issued') {
        fineAmount = calculateFine(item.due_date, new Date());
      }
      return {
        ...item,
        current_fine: fineAmount
      };
    }).filter(item => item.current_fine > 0);

    return res.json(finesList);
  } catch (error) {
    console.error('Error fetching overdue fines:', error);
    return res.status(500).json({ message: 'Server error fetching overdue fines.' });
  }
};

// PUT /api/fines/:transactionId/pay
exports.payFine = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction record not found.' });
    }

    if (transaction.status === 'issued') {
      // Lock current live fine into fine_amount before marking paid if returning isn't triggered yet
      const liveFine = calculateFine(transaction.due_date, new Date());
      await transaction.update({
        fine_amount: liveFine,
        fine_paid: true
      });
    } else {
      await transaction.update({
        fine_paid: true
      });
    }

    return res.json({ message: 'Fine marked as paid successfully!', transaction });
  } catch (error) {
    console.error('Error marking fine paid:', error);
    return res.status(500).json({ message: 'Server error updating fine status.' });
  }
};
