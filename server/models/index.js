const sequelize = require('../config/db');
const User = require('./User');
const Book = require('./Book');
const Ebook = require('./Ebook');
const Transaction = require('./Transaction');
const Reservation = require('./Reservation');
const Review = require('./Review');

// Book <-> Ebook (1-to-1 or 1-to-many, per prompt: ebooks table has book_id)
Book.hasOne(Ebook, { foreignKey: 'book_id', as: 'ebook', onDelete: 'CASCADE' });
Ebook.belongsTo(Book, { foreignKey: 'book_id', as: 'book' });

// User <-> Transaction
User.hasMany(Transaction, { foreignKey: 'user_id', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Transaction <-> Book
Book.hasMany(Transaction, { foreignKey: 'book_id', as: 'transactions' });
Transaction.belongsTo(Book, { foreignKey: 'book_id', as: 'book' });

// Transaction <-> User (issued_by / librarian)
User.hasMany(Transaction, { foreignKey: 'issued_by', as: 'processed_issues' });
Transaction.belongsTo(User, { foreignKey: 'issued_by', as: 'librarian' });

// User <-> Reservation
User.hasMany(Reservation, { foreignKey: 'user_id', as: 'reservations' });
Reservation.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Book <-> Reservation
Book.hasMany(Reservation, { foreignKey: 'book_id', as: 'reservations' });
Reservation.belongsTo(Book, { foreignKey: 'book_id', as: 'book' });

// User <-> Review
User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Book <-> Review
Book.hasMany(Review, { foreignKey: 'book_id', as: 'reviews' });
Review.belongsTo(Book, { foreignKey: 'book_id', as: 'book' });

module.exports = {
  sequelize,
  User,
  Book,
  Ebook,
  Transaction,
  Reservation,
  Review
};
