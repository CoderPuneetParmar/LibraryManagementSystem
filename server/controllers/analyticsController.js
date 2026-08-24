const { User, Book, Transaction, sequelize } = require('../models');
const { Op } = require('sequelize');

// GET /api/analytics/dashboard (Admin only)
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const today = new Date();

    // 1. Stat cards totals
    const totalBooks = await Book.count();
    const totalMembers = await User.count({ where: { role: 'member' } });
    
    const currentlyIssued = await Transaction.count({
      where: { status: 'issued' }
    });

    const overdueCount = await Transaction.count({
      where: {
        status: 'issued',
        due_date: { [Op.lt]: today }
      }
    });

    // Total fines collected (paid fines)
    const finesResult = await Transaction.sum('fine_amount', {
      where: { fine_paid: true }
    });
    const totalFinesCollected = finesResult ? parseFloat(finesResult) : 0;

    // 2. Top 5 Most-Issued Books
    const topBooksData = await Transaction.findAll({
      attributes: [
        'book_id',
        [sequelize.fn('COUNT', sequelize.col('Transaction.id')), 'issue_count']
      ],
      include: [
        { model: Book, as: 'book', attributes: ['id', 'title', 'author', 'genre', 'cover_image_url'] }
      ],
      group: ['book_id', 'book.id'],
      order: [[sequelize.literal('issue_count'), 'DESC']],
      limit: 5
    });

    const mostIssuedBooks = topBooksData.map(item => ({
      book_id: item.book_id,
      title: item.book ? item.book.title : 'Unknown',
      author: item.book ? item.book.author : 'Unknown',
      genre: item.book ? item.book.genre : 'General',
      cover_image_url: item.book ? item.book.cover_image_url : '',
      issue_count: parseInt(item.get('issue_count'), 10)
    }));

    // 3. Monthly Issue Counts for last 6 months (for Recharts)
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthLabel = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      
      const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const count = await Transaction.count({
        where: {
          issue_date: {
            [Op.between]: [startOfMonth, endOfMonth]
          }
        }
      });

      months.push({
        month: monthLabel,
        issues: count
      });
    }

    return res.json({
      totals: {
        total_books: totalBooks,
        total_members: totalMembers,
        currently_issued: currentlyIssued,
        overdue_count: overdueCount,
        total_fines_collected: totalFinesCollected
      },
      most_issued_books: mostIssuedBooks,
      monthly_issues: months
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({ message: 'Server error fetching analytics dashboard.' });
  }
};
