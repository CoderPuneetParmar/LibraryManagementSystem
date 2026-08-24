const { Op } = require('sequelize');
const { Book, Ebook, Review, User } = require('../models');

// GET /api/books - Get all books with optional search, genre, available filters
exports.getAllBooks = async (req, res) => {
  try {
    const { search, genre, available } = req.query;
    const where = {};

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { author: { [Op.like]: `%${search}%` } },
        { isbn: { [Op.like]: `%${search}%` } }
      ];
    }

    if (genre) {
      where.genre = genre;
    }

    if (available === 'true') {
      where.available_copies = { [Op.gt]: 0 };
    }

    const books = await Book.findAll({
      where,
      include: [
        { model: Ebook, as: 'ebook', attributes: ['id', 'file_url', 'file_type'] },
        { model: Review, as: 'reviews', attributes: ['rating'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Format output with average rating
    const result = books.map(book => {
      const b = book.toJSON();
      const ratings = b.reviews ? b.reviews.map(r => r.rating) : [];
      const avgRating = ratings.length > 0
        ? (ratings.reduce((acc, cur) => acc + cur, 0) / ratings.length).toFixed(1)
        : null;
      return {
        ...b,
        average_rating: avgRating ? parseFloat(avgRating) : null,
        review_count: ratings.length
      };
    });

    return res.json(result);
  } catch (error) {
    console.error('Error fetching books:', error);
    return res.status(500).json({ message: 'Server error fetching catalog books.' });
  }
};

// GET /api/books/:id - Get detailed book info
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id, {
      include: [
        { model: Ebook, as: 'ebook' },
        {
          model: Review,
          as: 'reviews',
          include: [{ model: User, as: 'user', attributes: ['id', 'name'] }]
        }
      ]
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    const b = book.toJSON();
    const ratings = b.reviews ? b.reviews.map(r => r.rating) : [];
    const avgRating = ratings.length > 0
      ? (ratings.reduce((acc, cur) => acc + cur, 0) / ratings.length).toFixed(1)
      : null;

    return res.json({
      ...b,
      average_rating: avgRating ? parseFloat(avgRating) : null,
      review_count: ratings.length
    });
  } catch (error) {
    console.error('Error fetching book details:', error);
    return res.status(500).json({ message: 'Server error fetching book details.' });
  }
};

// POST /api/books (Admin only) - Create book + optional ebook
exports.createBook = async (req, res) => {
  try {
    const { title, author, genre, isbn, description, cover_image_url, total_copies, file_url, file_type } = req.body;

    if (!title || !author || !genre) {
      return res.status(400).json({ message: 'Title, author, and genre are required.' });
    }

    const copies = total_copies ? parseInt(total_copies, 10) : 1;

    const newBook = await Book.create({
      title,
      author,
      genre,
      isbn: isbn || null,
      description: description || '',
      cover_image_url: cover_image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
      total_copies: copies,
      available_copies: copies,
      added_date: new Date()
    });

    if (file_url) {
      await Ebook.create({
        book_id: newBook.id,
        file_url,
        file_type: file_type || 'pdf'
      });
    }

    const fullBook = await Book.findByPk(newBook.id, {
      include: [{ model: Ebook, as: 'ebook' }]
    });

    return res.status(201).json(fullBook);
  } catch (error) {
    console.error('Error creating book:', error);
    return res.status(500).json({ message: 'Server error creating book.' });
  }
};

// PUT /api/books/:id (Admin only) - Update book
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id, {
      include: [{ model: Ebook, as: 'ebook' }]
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    const { title, author, genre, isbn, description, cover_image_url, total_copies, available_copies, file_url, file_type } = req.body;

    await book.update({
      title: title !== undefined ? title : book.title,
      author: author !== undefined ? author : book.author,
      genre: genre !== undefined ? genre : book.genre,
      isbn: isbn !== undefined ? isbn : book.isbn,
      description: description !== undefined ? description : book.description,
      cover_image_url: cover_image_url !== undefined ? cover_image_url : book.cover_image_url,
      total_copies: total_copies !== undefined ? parseInt(total_copies, 10) : book.total_copies,
      available_copies: available_copies !== undefined ? parseInt(available_copies, 10) : book.available_copies
    });

    // Update or create ebook if file_url provided
    if (file_url !== undefined) {
      if (file_url) {
        if (book.ebook) {
          await book.ebook.update({ file_url, file_type: file_type || book.ebook.file_type });
        } else {
          await Ebook.create({ book_id: book.id, file_url, file_type: file_type || 'pdf' });
        }
      } else if (book.ebook) {
        await book.ebook.destroy();
      }
    }

    const updated = await Book.findByPk(book.id, {
      include: [{ model: Ebook, as: 'ebook' }]
    });

    return res.json(updated);
  } catch (error) {
    console.error('Error updating book:', error);
    return res.status(500).json({ message: 'Server error updating book.' });
  }
};

// DELETE /api/books/:id (Admin only)
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    await book.destroy();
    return res.json({ message: 'Book deleted successfully.' });
  } catch (error) {
    console.error('Error deleting book:', error);
    return res.status(500).json({ message: 'Server error deleting book.' });
  }
};
