const { Reservation } = require('../models');

/**
 * Checks if there is a waiting reservation for a given book.
 * If found, promotes the reservation with the lowest queue_position to 'ready'.
 * 
 * @param {number} bookId 
 * @returns {Promise<Object|null>} The promoted reservation, or null if none was waiting
 */
async function promoteNextReservation(bookId) {
  try {
    const nextReservation = await Reservation.findOne({
      where: {
        book_id: bookId,
        status: 'waiting'
      },
      order: [['queue_position', 'ASC']]
    });

    if (!nextReservation) {
      return null;
    }

    const now = new Date();
    const expiry = new Date(now);
    expiry.setDate(now.getDate() + 3); // 3 days hold period

    await nextReservation.update({
      status: 'ready',
      ready_date: now,
      expiry_date: expiry
    });

    console.log(`Reservation ID #${nextReservation.id} for User #${nextReservation.user_id} promoted to READY on Book #${bookId}. Expires: ${expiry.toISOString()}`);
    return nextReservation;
  } catch (error) {
    console.error(`Error promoting reservation for Book #${bookId}:`, error);
    throw error;
  }
}

module.exports = { promoteNextReservation };
