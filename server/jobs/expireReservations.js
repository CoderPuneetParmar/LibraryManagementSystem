const { Reservation, Book } = require('../models');
const { Op } = require('sequelize');
const { promoteNextReservation } = require('../utils/reservationQueue');

/**
 * Checks for all 'ready' reservations whose expiry_date has passed.
 * Marks them as 'expired' and promotes the next waiting member,
 * or returns the copy to general availability if no one is waiting.
 * 
 * @returns {Promise<Object>} Summary of expired and promoted counts
 */
async function checkExpiredReservations() {
  try {
    const now = new Date();

    const expiredList = await Reservation.findAll({
      where: {
        status: 'ready',
        expiry_date: {
          [Op.lt]: now
        }
      },
      include: [{ model: Book, as: 'book' }]
    });

    let countExpired = 0;
    let countPromoted = 0;

    for (const resv of expiredList) {
      await resv.update({ status: 'expired' });
      countExpired++;

      const nextPromoted = await promoteNextReservation(resv.book_id);
      if (nextPromoted) {
        countPromoted++;
      } else {
        // No one else was waiting for this book -> copy becomes generally available
        await resv.book.increment('available_copies');
      }
    }

    console.log(`[Expiry Job] Checked at ${now.toISOString()} - Expired: ${countExpired}, Promoted Next: ${countPromoted}`);
    return { expired_count: countExpired, promoted_count: countPromoted };
  } catch (error) {
    console.error('[Expiry Job Error]:', error);
    throw error;
  }
}

module.exports = { checkExpiredReservations };
