/**
 * Reusable Date Formatting Utility
 * Formats any date string, Date object, or timestamp into DD-MM-YYYY format.
 * 
 * @param {string|Date|number} dateInput - The date to format
 * @param {boolean} [includeTime=false] - Optional flag to append time (HH:mm)
 * @returns {string} Formatted date string (e.g. '06-09-2026' or '06-09-2026 14:30')
 */
export function formatDate(dateInput, includeTime = false) {
  if (!dateInput) return '—';

  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '—';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = d.getFullYear();

  let formatted = `${day}-${month}-${year}`;

  if (includeTime) {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    formatted += ` ${hours}:${minutes}`;
  }

  return formatted;
}

export default formatDate;
