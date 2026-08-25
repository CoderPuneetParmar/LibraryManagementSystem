const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const booksRoutes = require('./routes/books');
const ebooksRoutes = require('./routes/ebooks');
const transactionsRoutes = require('./routes/transactions');
const finesRoutes = require('./routes/fines');
const reservationsRoutes = require('./routes/reservations');
const reviewsRoutes = require('./routes/reviews');
const analyticsRoutes = require('./routes/analytics');
const cron = require('node-cron');
const { checkExpiredReservations } = require('./jobs/expireReservations');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/ebooks', ebooksRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/fines', finesRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/analytics', analyticsRoutes);

// Daily cron job at midnight to auto-expire reservations
cron.schedule('0 0 * * *', () => {
  console.log('Running daily reservation auto-expiry cron job...');
  checkExpiredReservations();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Library System API is running smoothly' });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  sequelize.authenticate()
    .then(() => {
      console.log('MySQL Database Connected.');
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server listening on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Unable to connect to database:', err);
    });
}

module.exports = app;
