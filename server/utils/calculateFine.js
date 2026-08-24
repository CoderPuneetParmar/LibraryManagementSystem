/**
 * Shared Fine Calculation Utility
 * Rate: ₹5 per day late
 * Cap: ₹200 max per transaction
 * 
 * @param {string|Date} dueDate - The transaction due date
 * @param {string|Date} [endDate=new Date()] - The date to calculate against (today for live preview, return_date for return)
 * @returns {number} Calculated fine amount (rounded to 2 decimals)
 */
function calculateFine(dueDate, endDate = new Date()) {
  if (!dueDate) return 0;

  const due = new Date(dueDate);
  const end = new Date(endDate);

  // Strip time components to calculate exact calendar days difference
  due.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffTime = end.getTime() - due.getTime();
  const daysLate = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (daysLate <= 0) {
    return 0;
  }

  const fineRatePerDay = 5;
  const maxCap = 200;

  const fine = Math.min(daysLate * fineRatePerDay, maxCap);
  return Number(fine.toFixed(2));
}

module.exports = calculateFine;
