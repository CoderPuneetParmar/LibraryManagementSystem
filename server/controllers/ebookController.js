const { Ebook, Book } = require('../models');

// GET /api/ebooks - Get all ebooks with associated book info
exports.getAllEbooks = async (req, res) => {
  try {
    const ebooks = await Ebook.findAll({
      include: [
        {
          model: Book,
          as: 'book',
          attributes: ['id', 'title', 'author', 'genre', 'cover_image_url', 'description']
        }
      ]
    });
    return res.json(ebooks);
  } catch (error) {
    console.error('Error fetching ebooks:', error);
    return res.status(500).json({ message: 'Server error fetching e-books.' });
  }
};

// GET /api/ebooks/:id
exports.getEbookById = async (req, res) => {
  try {
    const ebook = await Ebook.findByPk(req.params.id, {
      include: [
        {
          model: Book,
          as: 'book'
        }
      ]
    });

    if (!ebook) {
      return res.status(404).json({ message: 'E-book not found.' });
    }

    return res.json(ebook);
  } catch (error) {
    console.error('Error fetching ebook details:', error);
    return res.status(500).json({ message: 'Server error fetching e-book details.' });
  }
};
