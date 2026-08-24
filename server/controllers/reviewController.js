const { Review, User, Book } = require('../models');

// POST /api/reviews (Member creates review)
exports.createReview = async (req, res) => {
  try {
    const { bookId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!bookId || !rating) {
      return res.status(400).json({ message: 'Book ID and rating (1-5) are required.' });
    }

    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    const review = await Review.create({
      user_id: userId,
      book_id: bookId,
      rating: parseInt(rating, 10),
      comment: comment || '',
      date: new Date()
    });

    const fullReview = await Review.findByPk(review.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name'] }]
    });

    return res.status(201).json(fullReview);
  } catch (error) {
    console.error('Error creating review:', error);
    return res.status(500).json({ message: 'Server error creating review.' });
  }
};

// GET /api/reviews/book/:bookId
exports.getReviewsByBook = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { book_id: req.params.bookId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']]
    });

    return res.json(reviews);
  } catch (error) {
    console.error('Error fetching book reviews:', error);
    return res.status(500).json({ message: 'Server error fetching reviews.' });
  }
};
