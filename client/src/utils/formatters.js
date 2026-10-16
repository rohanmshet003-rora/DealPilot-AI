/**
 * Universal Indian Rupee (₹ - INR) Formatter
 * Formats numbers in standard Indian numbering system (e.g. ₹7,50,000)
 */
export function formatINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  const num = Math.round(Number(amount));
  return '₹' + num.toLocaleString('en-IN');
}

/**
 * Format plain number with Indian commas without symbol
 */
export function formatIndianNumber(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '0';
  const num = Math.round(Number(amount));
  return num.toLocaleString('en-IN');
}
