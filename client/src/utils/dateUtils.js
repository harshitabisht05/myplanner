/**
 * Helper to get local date string YYYY-MM-DD following device local timezone (e.g. Indian Standard Time IST)
 */
export const getLocalDateStr = (dateInput = new Date()) => {
  const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
